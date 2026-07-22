print("[GroundStabilizer] Starting generation...")

local workspace = game:GetService("Workspace")

-- Cleanup existing
local existing = workspace:FindFirstChild("GroundStabilizer")
if existing then
    print("[GroundStabilizer] Removing existing model...")
    existing:Destroy()
    task.wait()
end

local model = Instance.new("Model")
model.Name = "GroundStabilizer"

local function createPart(name, shape, size, color, material, cframe)
    local part = Instance.new("Part")
    part.Name = name
    part.Shape = shape
    part.Size = size
    part.Color = Color3.fromRGB(color[1], color[2], color[3])
    part.Material = material
    part.CFrame = cframe
    part.Anchored = true
    part.TopSurface = Enum.SurfaceType.Smooth
    part.BottomSurface = Enum.SurfaceType.Smooth
    part.Parent = model
    return part
end

print("[GroundStabilizer] Creating HousingBase...")
local housingBase = createPart("HousingBase", Enum.PartType.Block, Vector3.new(12, 3, 8), {60, 55, 50}, Enum.Material.Metal, CFrame.new(0, 1.5, 0))
model.PrimaryPart = housingBase

print("[GroundStabilizer] Creating HousingTop...")
createPart("HousingTop", Enum.PartType.Block, Vector3.new(10, 2, 6), {80, 70, 65}, Enum.Material.Metal, CFrame.new(0, 3.5, 0))

print("[GroundStabilizer] Creating AngledPanels...")
createPart("AngledPanelLeft", Enum.PartType.Block, Vector3.new(6, 2, 0.5), {180, 100, 40}, Enum.Material.SmoothPlastic, CFrame.new(-4, 3, 0) * CFrame.Angles(0, 0, math.rad(25)))
createPart("AngledPanelRight", Enum.PartType.Block, Vector3.new(6, 2, 0.5), {180, 100, 40}, Enum.Material.SmoothPlastic, CFrame.new(4, 3, 0) * CFrame.Angles(0, 0, math.rad(-25)))

print("[GroundStabilizer] Creating EmitterCore...")
local emitterCore = createPart("EmitterCore", Enum.PartType.Cylinder, Vector3.new(2, 4, 4), {200, 50, 255}, Enum.Material.Neon, CFrame.new(0, 5, 0) * CFrame.Angles(0, 0, math.rad(90)))
local emitterGlow = Instance.new("PointLight")
emitterGlow.Name = "EmitterGlow"
emitterGlow.Color = Color3.fromRGB(200, 50, 255)
emitterGlow.Range = 25
emitterGlow.Brightness = 0
emitterGlow.Parent = emitterCore

print("[GroundStabilizer] Creating IndicatorLights...")
createPart("IndicatorLight1", Enum.PartType.Ball, Vector3.new(1, 1, 1), {0, 200, 220}, Enum.Material.Neon, CFrame.new(-5, 1.5, 3))
createPart("IndicatorLight2", Enum.PartType.Ball, Vector3.new(1, 1, 1), {0, 200, 220}, Enum.Material.Neon, CFrame.new(5, 1.5, 3))
createPart("IndicatorLight3", Enum.PartType.Ball, Vector3.new(1, 1, 1), {0, 200, 220}, Enum.Material.Neon, CFrame.new(-5, 1.5, -3))
createPart("IndicatorLight4", Enum.PartType.Ball, Vector3.new(1, 1, 1), {0, 200, 220}, Enum.Material.Neon, CFrame.new(5, 1.5, -3))

print("[GroundStabilizer] Creating Feet...")
local footLeft = Instance.new("WedgePart")
footLeft.Name = "FootLeft"
footLeft.Size = Vector3.new(2, 1, 3)
footLeft.Color = Color3.fromRGB(50, 50, 55)
footLeft.Material = Enum.Material.Metal
footLeft.CFrame = CFrame.new(-7, 0.5, 0)
footLeft.Anchored = true
footLeft.TopSurface = Enum.SurfaceType.Smooth
footLeft.BottomSurface = Enum.SurfaceType.Smooth
footLeft.Parent = model

local footRight = Instance.new("WedgePart")
footRight.Name = "FootRight"
footRight.Size = Vector3.new(2, 1, 3)
footRight.Color = Color3.fromRGB(50, 50, 55)
footRight.Material = Enum.Material.Metal
footRight.CFrame = CFrame.new(7, 0.5, 0)
footRight.Anchored = true
footRight.TopSurface = Enum.SurfaceType.Smooth
footRight.BottomSurface = Enum.SurfaceType.Smooth
footRight.Parent = model

model.Parent = workspace
print("[GroundStabilizer] Successfully generated and placed in Workspace.")
