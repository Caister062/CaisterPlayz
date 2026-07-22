--[[
	EventRemotes.lua
	Paste into the Roblox Studio Command Bar.

	Creates the three RemoteEvents used by the live-event system:
	  • EventShake      – camera shake  (intensity, duration)
	  • EventFlash      – full-screen white flash
	  • EventColorShift – tinted overlay (color, duration)

	Safe to run multiple times – skips events that already exist.
--]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local remoteNames = {
	"EventShake",
	"EventFlash",
	"EventColorShift",
}

for _, name in ipairs(remoteNames) do
	if not ReplicatedStorage:FindFirstChild(name) then
		local remote = Instance.new("RemoteEvent")
		remote.Name = name
		remote.Parent = ReplicatedStorage
		print("[EventRemotes] Created RemoteEvent: " .. name)
	else
		print("[EventRemotes] Already exists: " .. name)
	end
end

print("==============================================")
print("  [EventRemotes] All RemoteEvents ready!  ")
print("==============================================")
