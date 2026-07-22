local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Lighting = game:GetService("Lighting")

print("[EventSetup] Starting scene setup...")

---------------------------------------------------------------------
-- 1. Cleanup
---------------------------------------------------------------------
local function cleanup()
	for _, child in ipairs(Workspace:GetChildren()) do
		if child.Name == "Stabilizer" or child.Name == "EventFocalPoint" or child.Name == "EventEffects" or child.Name == "EventGround" or child.Name == "GroundStabilizer" then
			child:Destroy()
		end
	end
	
	for _, child in ipairs(ReplicatedStorage:GetChildren()) do
		if child.Name == "StabilizerTemplate" then
			child:Destroy()
		end
	end
	
	for _, child in ipairs(Lighting:GetChildren()) do
		if child.Name == "EventBloom" or child.Name == "EventCC" or child.Name == "EventAtmosphere" or child.Name == "EventSunRays" then
			child:Destroy()
		end
	end
end

cleanup()
task.wait(0.5)

---------------------------------------------------------------------
-- 2. Ground
---------------------------------------------------------------------
local ground = Instance.new("Part")
ground.Name = "EventGround"
ground.Size = Vector3.new(2000, 20, 2000)
ground.Position = Vector3.new(0, -10, 0)
ground.Anchored = true
ground.Color = Color3.fromRGB(0, 255, 0) -- Bright green
ground.Material = Enum.Material.Grass
ground.Parent = Workspace

---------------------------------------------------------------------
-- 3. Lighting
---------------------------------------------------------------------
Lighting.ClockTime = 14
Lighting.Brightness = 2
Lighting.GlobalShadows = true

---------------------------------------------------------------------
-- 4. Post-Processing
---------------------------------------------------------------------
local bloom = Instance.new("BloomEffect")
bloom.Name = "EventBloom"
bloom.Intensity = 1.5
bloom.Size = 40
bloom.Threshold = 1
bloom.Parent = Lighting

local cc = Instance.new("ColorCorrectionEffect")
cc.Name = "EventCC"
cc.Brightness = 0
cc.Contrast = 0.15
cc.Saturation = 0.2
cc.Parent = Lighting

local atmosphere = Instance.new("Atmosphere")
atmosphere.Name = "EventAtmosphere"
atmosphere.Density = 0.3
atmosphere.Offset = 0.5
atmosphere.Color = Color3.fromRGB(180, 160, 200)
atmosphere.Decay = Color3.fromRGB(120, 100, 160)
atmosphere.Glare = 0.5
atmosphere.Haze = 3
atmosphere.Parent = Lighting

local sunrays = Instance.new("SunRaysEffect")
sunrays.Name = "EventSunRays"
sunrays.Intensity = 0.15
sunrays.Spread = 0.8
sunrays.Parent = Lighting

---------------------------------------------------------------------
-- 5. Stabilizer Model Template
---------------------------------------------------------------------
local stabilizerModel = Instance.new("Model")
stabilizerModel.Name = "StabilizerTemplate"

local function createPart(name, shape, size, color, material, cframe, parent)
	local part = Instance.new("Part")
	part.Name = name
	part.Shape = shape
	part.Size = size
	part.Color = color
	part.Material = material
	part.Anchored = true
	part.CFrame = cframe
	if shape == Enum.PartType.Cylinder or shape == Enum.PartType.Block then
		-- Smooth surfaces for blocks/cylinders if needed, but SmoothPlastic works as material
		part.TopSurface = Enum.SurfaceType.Smooth
		part.BottomSurface = Enum.SurfaceType.Smooth
	end
	part.Parent = parent
	return part
end

local containerBase = createPart("ContainerBase", Enum.PartType.Block, Vector3.new(16, 8, 10), Color3.fromRGB(40, 120, 60), Enum.Material.Metal, CFrame.new(0, 4, 0), stabilizerModel)
stabilizerModel.PrimaryPart = containerBase

createPart("SupportFrameLeft", Enum.PartType.Block, Vector3.new(4, 40, 4), Color3.fromRGB(60, 80, 120), Enum.Material.DiamondPlate, CFrame.new(-6, 20, 0) * CFrame.Angles(0, 0, math.rad(15)), stabilizerModel)
createPart("SupportFrameRight", Enum.PartType.Block, Vector3.new(4, 40, 4), Color3.fromRGB(60, 80, 120), Enum.Material.DiamondPlate, CFrame.new(6, 20, 0) * CFrame.Angles(0, 0, math.rad(-15)), stabilizerModel)
createPart("CrossBeam", Enum.PartType.Block, Vector3.new(18, 3, 3), Color3.fromRGB(50, 50, 55), Enum.Material.Metal, CFrame.new(0, 36, 0), stabilizerModel)
createPart("BarrelSphere", Enum.PartType.Ball, Vector3.new(28, 28, 28), Color3.fromRGB(70, 85, 110), Enum.Material.SmoothPlastic, CFrame.new(0, 38, 0), stabilizerModel)

createPart("BandStrip1", Enum.PartType.Block, Vector3.new(26, 1.5, 6), Color3.fromRGB(200, 60, 100), Enum.Material.Neon, CFrame.new(0, 38, 0), stabilizerModel)
createPart("BandStrip2", Enum.PartType.Block, Vector3.new(26, 1.5, 6), Color3.fromRGB(200, 60, 100), Enum.Material.Neon, CFrame.new(0, 42, 0), stabilizerModel)
createPart("BandStrip3", Enum.PartType.Block, Vector3.new(26, 1.5, 6), Color3.fromRGB(200, 60, 100), Enum.Material.Neon, CFrame.new(0, 34, 0), stabilizerModel)

local sensorDomeLeft = createPart("SensorDomeLeft", Enum.PartType.Ball, Vector3.new(6, 6, 6), Color3.fromRGB(200, 30, 30), Enum.Material.Neon, CFrame.new(-18, 30, 0), stabilizerModel)
local sdlLight = Instance.new("PointLight"); sdlLight.Color = Color3.fromRGB(200, 30, 30); sdlLight.Range = 20; sdlLight.Brightness = 0; sdlLight.Parent = sensorDomeLeft

local sensorDomeRight = createPart("SensorDomeRight", Enum.PartType.Ball, Vector3.new(6, 6, 6), Color3.fromRGB(200, 30, 30), Enum.Material.Neon, CFrame.new(18, 30, 0), stabilizerModel)
local sdrLight = Instance.new("PointLight"); sdrLight.Color = Color3.fromRGB(200, 30, 30); sdrLight.Range = 20; sdrLight.Brightness = 0; sdrLight.Parent = sensorDomeRight

local sensorDomeTop = createPart("SensorDomeTop", Enum.PartType.Ball, Vector3.new(5, 5, 5), Color3.fromRGB(200, 30, 30), Enum.Material.Neon, CFrame.new(0, 54, 0), stabilizerModel)
local sdtLight = Instance.new("PointLight"); sdtLight.Color = Color3.fromRGB(200, 30, 30); sdtLight.Range = 20; sdtLight.Brightness = 0; sdtLight.Parent = sensorDomeTop

local emitter = createPart("Emitter", Enum.PartType.Cylinder, Vector3.new(6, 12, 12), Color3.fromRGB(200, 50, 255), Enum.Material.Neon, CFrame.new(0, 55, 0) * CFrame.Angles(0, 0, math.rad(90)), stabilizerModel)

local glowLight = Instance.new("PointLight")
glowLight.Name = "GlowLight"
glowLight.Color = Color3.fromRGB(200, 50, 255)
glowLight.Range = 40
glowLight.Brightness = 0
glowLight.Parent = emitter

local shieldDisc = createPart("ShieldDisc", Enum.PartType.Cylinder, Vector3.new(1, 14, 14), Color3.fromRGB(180, 200, 255), Enum.Material.ForceField, CFrame.new(0, 58, 0) * CFrame.Angles(0, 0, math.rad(90)), stabilizerModel)
shieldDisc.Transparency = 0.5
shieldDisc.CanCollide = false

-- Cable Details
createPart("Cable1", Enum.PartType.Block, Vector3.new(0.5, 18, 0.5), Color3.fromRGB(139, 69, 19), Enum.Material.SmoothPlastic, CFrame.new(-5, 12, 2.5) * CFrame.Angles(0, 0, math.rad(15)), stabilizerModel)
createPart("Cable2", Enum.PartType.Block, Vector3.new(0.5, 18, 0.5), Color3.fromRGB(255, 140, 0), Enum.Material.SmoothPlastic, CFrame.new(5, 12, 2.5) * CFrame.Angles(0, 0, math.rad(-15)), stabilizerModel)

stabilizerModel.Parent = ReplicatedStorage

---------------------------------------------------------------------
-- 6. Focal Point
---------------------------------------------------------------------
local focalPoint = Instance.new("Part")
focalPoint.Name = "EventFocalPoint"
focalPoint.Size = Vector3.new(4, 4, 4)
focalPoint.Position = Vector3.new(0, 300, 0)
focalPoint.Anchored = true
focalPoint.Transparency = 1
focalPoint.CanCollide = false
focalPoint.Parent = Workspace

---------------------------------------------------------------------
-- 7. Place 3 Stabilizers
---------------------------------------------------------------------
local radius = 250
local angles = {0, math.pi * 2/3, math.pi * 4/3}

for i, angle in ipairs(angles) do
	local clone = stabilizerModel:Clone()
	clone.Name = "Stabilizer"
	
	local x = radius * math.cos(angle)
	local z = radius * math.sin(angle)
	local targetPos = Vector3.new(x, 4, z)
	
	-- Face the focal point (horizontal projection)
	local lookTarget = Vector3.new(focalPoint.Position.X, targetPos.Y, focalPoint.Position.Z)
	local newCFrame = CFrame.lookAt(targetPos, lookTarget)
	
	clone:SetPrimaryPartCFrame(newCFrame)
	clone.Parent = Workspace
end

print("[EventSetup] Scene setup complete! The event environment is ready.")
