--[[
	EventCameraShake (LocalScript)
	Place in StarterPlayerScripts

	Listens for three RemoteEvents in ReplicatedStorage:
	  • EventShake(intensity, duration)   – camera shake with natural decay
	  • EventFlash()                       – full-screen white flash
	  • EventColorShift(color, duration)   – tinted overlay that fades out
]]

local Players        = game:GetService("Players")
local RunService     = game:GetService("RunService")
local TweenService   = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local camera = workspace.CurrentCamera

--------------------------------------------------------------------------------
-- Utility: create a full-screen overlay frame inside a temporary ScreenGui
--------------------------------------------------------------------------------
local function createOverlay(color: Color3, initialTransparency: number): (ScreenGui, Frame)
	local playerGui = player:WaitForChild("PlayerGui")

	local gui = Instance.new("ScreenGui")
	gui.Name               = "EventOverlay_" .. tostring(tick())
	gui.ResetOnSpawn       = false
	gui.IgnoreGuiInset     = true
	gui.DisplayOrder       = 100
	gui.Parent             = playerGui

	local frame = Instance.new("Frame")
	frame.Name                 = "Overlay"
	frame.Size                 = UDim2.fromScale(1, 1)
	frame.Position             = UDim2.fromScale(0, 0)
	frame.BackgroundColor3     = color
	frame.BackgroundTransparency = initialTransparency
	frame.BorderSizePixel      = 0
	frame.ZIndex               = 100
	frame.Parent               = gui

	return gui, frame
end

--------------------------------------------------------------------------------
-- Camera Shake
--
-- Applies random rotational offsets that decay naturally over the duration.
-- Uses a slight per-axis frequency variation so the shake feels organic rather
-- than perfectly uniform.
--------------------------------------------------------------------------------
local shakeConnection: RBXScriptConnection? = nil

local function applyCameraShake(intensity: number, duration: number)
	-- If a shake is already running, disconnect it first so they don't stack
	if shakeConnection then
		shakeConnection:Disconnect()
		shakeConnection = nil
	end

	local elapsed = 0

	-- Small random seeds so each axis wobbles at a different rate
	local freqX = 14 + math.random() * 6   -- 14-20 Hz feel
	local freqY = 12 + math.random() * 8   -- 12-20 Hz feel
	local freqZ = 10 + math.random() * 4   -- subtle roll

	shakeConnection = RunService.RenderStepped:Connect(function(dt: number)
		elapsed += dt

		if elapsed >= duration then
			-- Restore camera and clean up
			camera.CFrame = camera.CFrame * CFrame.Angles(0, 0, 0)
			if shakeConnection then
				shakeConnection:Disconnect()
				shakeConnection = nil
			end
			return
		end

		-- Smooth decay: fast initial falloff, gentle tail
		local progress = elapsed / duration
		local decay = (1 - progress) * (1 - progress)  -- quadratic ease-out

		-- Add a tiny bit of randomness each frame so it never looks repetitive
		local jitterX = math.sin(elapsed * freqX + math.random() * 0.3)
		local jitterY = math.cos(elapsed * freqY + math.random() * 0.3)
		local jitterZ = math.sin(elapsed * freqZ * 0.5 + math.random() * 0.2)

		local shakeX = jitterX * intensity * decay * 0.02   -- pitch
		local shakeY = jitterY * intensity * decay * 0.02   -- yaw
		local shakeZ = jitterZ * intensity * decay * 0.005  -- subtle roll

		camera.CFrame = camera.CFrame * CFrame.Angles(shakeX, shakeY, shakeZ)
	end)
end

--------------------------------------------------------------------------------
-- Screen Flash
--
-- Instantly shows a white overlay, then tweens it fully transparent and removes
-- the GUI. The tween uses Quad easing so the flash lingers briefly then fades.
--------------------------------------------------------------------------------
local function applyScreenFlash()
	local gui, frame = createOverlay(Color3.new(1, 1, 1), 0) -- fully opaque white

	local tweenInfo = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	local tween = TweenService:Create(frame, tweenInfo, {
		BackgroundTransparency = 1,
	})

	tween.Completed:Once(function()
		gui:Destroy()
	end)

	tween:Play()
end

--------------------------------------------------------------------------------
-- Color Shift
--
-- Lays a tinted overlay at low opacity (0.7–0.9 transparency, so it's subtle)
-- then fades it out over the given duration.
--------------------------------------------------------------------------------
local function applyColorShift(color: Color3, duration: number)
	-- Pick a transparency in the 0.7-0.9 range for a gentle tint
	local startTransparency = 0.7 + math.random() * 0.2

	local gui, frame = createOverlay(color, startTransparency)

	local tweenInfo = TweenInfo.new(
		duration,
		Enum.EasingStyle.Sine,
		Enum.EasingDirection.Out
	)
	local tween = TweenService:Create(frame, tweenInfo, {
		BackgroundTransparency = 1,
	})

	tween.Completed:Once(function()
		gui:Destroy()
	end)

	tween:Play()
end

--------------------------------------------------------------------------------
-- Event Connections
--------------------------------------------------------------------------------
local TIMEOUT = 10

local shakeEvent = ReplicatedStorage:WaitForChild("EventShake", TIMEOUT)
local flashEvent = ReplicatedStorage:WaitForChild("EventFlash", TIMEOUT)
local colorEvent = ReplicatedStorage:WaitForChild("EventColorShift", TIMEOUT)

if shakeEvent then
	shakeEvent.OnClientEvent:Connect(function(intensity: number, duration: number)
		-- Clamp to sane defaults
		intensity = math.clamp(intensity or 5, 0.1, 50)
		duration  = math.clamp(duration  or 1, 0.1, 15)
		applyCameraShake(intensity, duration)
	end)
else
	warn("[EventCameraShake] EventShake RemoteEvent not found – shake disabled")
end

if flashEvent then
	flashEvent.OnClientEvent:Connect(function()
		applyScreenFlash()
	end)
else
	warn("[EventCameraShake] EventFlash RemoteEvent not found – flash disabled")
end

if colorEvent then
	colorEvent.OnClientEvent:Connect(function(color: Color3, duration: number)
		color    = color    or Color3.fromRGB(255, 100, 50)
		duration = math.clamp(duration or 2, 0.1, 20)
		applyColorShift(color, duration)
	end)
else
	warn("[EventCameraShake] EventColorShift RemoteEvent not found – color shift disabled")
end
