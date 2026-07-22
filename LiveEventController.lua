-- LiveEventController.lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local Workspace = game:GetService("Workspace")
local Lighting = game:GetService("Lighting")

-- Constants
local FOCAL_POS = Vector3.new(0, 300, 0)
local EFFECTS_FOLDER_NAME = "EventEffects"

-- Event Remotes
local EventShake = ReplicatedStorage:WaitForChild("EventShake", 5) or Instance.new("RemoteEvent", ReplicatedStorage)
EventShake.Name = "EventShake"
local EventFlash = ReplicatedStorage:WaitForChild("EventFlash", 5) or Instance.new("RemoteEvent", ReplicatedStorage)
EventFlash.Name = "EventFlash"
local EventColorShift = ReplicatedStorage:WaitForChild("EventColorShift", 5) or Instance.new("RemoteEvent", ReplicatedStorage)
EventColorShift.Name = "EventColorShift"

-- Folder setup
local effectsFolder = Workspace:FindFirstChild(EFFECTS_FOLDER_NAME)
if not effectsFolder then
    effectsFolder = Instance.new("Folder")
    effectsFolder.Name = EFFECTS_FOLDER_NAME
    effectsFolder.Parent = Workspace
end

-- Helpers
local function makePart(name, size, color, material, shape)
    local p = Instance.new("Part")
    p.Name = name
    p.Size = size
    if typeof(color) == "Color3" then
        p.Color = color
    else
        p.BrickColor = color
    end
    p.Material = material or Enum.Material.Neon
    p.Shape = shape or Enum.PartType.Block
    p.Anchored = true
    p.CanCollide = false
    p.TopSurface = Enum.SurfaceType.Smooth
    p.BottomSurface = Enum.SurfaceType.Smooth
    p.Parent = effectsFolder
    return p
end

local function tweenProperty(instance, props, duration, easingStyle, easingDirection, repeatCount, reverses)
    local tweenInfo = TweenInfo.new(
        duration or 1,
        easingStyle or Enum.EasingStyle.Linear,
        easingDirection or Enum.EasingDirection.InOut,
        repeatCount or 0,
        reverses or false,
        0
    )
    local tween = TweenService:Create(instance, tweenInfo, props)
    tween:Play()
    return tween
end

local function createLightningBolt(startPos, endPos, color, segments, jitter)
    local parts = {}
    local dist = (endPos - startPos).Magnitude
    local segmentLength = dist / segments
    local currentPos = startPos
    
    for i = 1, segments do
        local nextPos
        if i == segments then
            nextPos = endPos
        else
            local dir = (endPos - currentPos).Unit
            local randomOffset = Vector3.new(
                (math.random() - 0.5) * jitter,
                (math.random() - 0.5) * jitter,
                (math.random() - 0.5) * jitter
            )
            nextPos = currentPos + (dir * segmentLength) + randomOffset
        end
        
        local pDist = (nextPos - currentPos).Magnitude
        local p = makePart("LightningSegment", Vector3.new(0.5, 0.5, pDist), color, Enum.Material.Neon, Enum.PartType.Block)
        p.CFrame = CFrame.lookAt(currentPos + (nextPos - currentPos) / 2, nextPos)
        
        table.insert(parts, p)
        currentPos = nextPos
    end
    
    return parts
end

local function createBeam(origin, target, layers)
    local parts = {}
    local dist = (target - origin).Magnitude
    local midPoint = origin + (target - origin) / 2
    local lookAtCFrame = CFrame.lookAt(midPoint, target) * CFrame.Angles(math.pi/2, 0, 0)
    
    for _, layer in ipairs(layers) do
        local color = layer.color
        local diameter = layer.diameter
        local p = makePart("BeamLayer", Vector3.new(diameter, dist, diameter), color, Enum.Material.Neon, Enum.PartType.Cylinder)
        p.CFrame = lookAtCFrame
        table.insert(parts, p)
    end
    return parts
end

local function getStabilizers()
    local stabilizers = {}
    for _, child in ipairs(Workspace:GetChildren()) do
        if child.Name == "Stabilizer" and child:IsA("Model") then
            table.insert(stabilizers, child)
        end
    end
    return stabilizers
end

local function getGroundStabilizer()
    return Workspace:FindFirstChild("GroundStabilizer")
end

-- Phases
local function phase1()
    print("[LiveEvent] Phase 1: Warning")
    EventShake:FireAllClients(2, 8)
    
    local stabilizers = getStabilizers()
    for _, stab in ipairs(stabilizers) do
        task.spawn(function()
            local domes = {"SensorDomeLeft", "SensorDomeRight", "SensorDomeTop"}
            for _, domeName in ipairs(domes) do
                local dome = stab:FindFirstChild(domeName)
                if dome then
                    local light = dome:FindFirstChildWhichIsA("PointLight")
                    if light then
                        tweenProperty(light, {Brightness = 3}, 0.5, Enum.EasingStyle.Sine, Enum.EasingDirection.Out, 15, true)
                    end
                end
            end
            
            local bands = {"BandStrip1", "BandStrip2", "BandStrip3"}
            for _, bandName in ipairs(bands) do
                local band = stab:FindFirstChild(bandName)
                if band then
                    tweenProperty(band, {Transparency = 0.5}, 0.5, Enum.EasingStyle.Sine, Enum.EasingDirection.Out, 15, true)
                end
            end
        end)
    end
    
    local groundStab = getGroundStabilizer()
    if groundStab then
        for i = 1, 4 do
            local ind = groundStab:FindFirstChild("IndicatorLight" .. i)
            if ind then
                tweenProperty(ind, {Size = Vector3.new(1.5, 1.5, 1.5)}, 0.5, Enum.EasingStyle.Sine, Enum.EasingDirection.Out, 15, true)
            end
        end
    end
    
    task.wait(8)
end

local function phase2()
    print("[LiveEvent] Phase 2: Charge-Up")
    EventShake:FireAllClients(5, 10)
    
    local stabilizers = getStabilizers()
    for _, stab in ipairs(stabilizers) do
        task.spawn(function()
            local emitter = stab:FindFirstChild("Emitter")
            if emitter then
                local glowLight = emitter:FindFirstChild("GlowLight") or emitter:FindFirstChildWhichIsA("PointLight")
                if glowLight then
                    tweenProperty(glowLight, {Brightness = 5}, 3)
                end
                
                -- Orbs
                for i = 1, 6 do
                    local offset = Vector3.new(math.random(-80, 80), math.random(-80, 80), math.random(-80, 80))
                    local pos = emitter.Position + offset
                    if offset.Magnitude < 50 then
                        pos = emitter.Position + offset.Unit * 50
                    end
                    local orb = makePart("ChargeOrb", Vector3.new(3, 3, 3), Color3.fromRGB(150, 0, 255), Enum.Material.Neon, Enum.PartType.Ball)
                    orb.Position = pos
                    
                    local t = tweenProperty(orb, {Position = emitter.Position}, math.random(20, 40)/10, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
                    t.Completed:Connect(function()
                        orb:Destroy()
                    end)
                end
                
                -- Aura
                local aura = makePart("Aura", Vector3.new(1, 1, 1), Color3.fromRGB(150, 0, 255), Enum.Material.Neon, Enum.PartType.Ball)
                aura.Position = emitter.Position
                aura.Transparency = 0.3
                tweenProperty(aura, {Size = Vector3.new(20, 20, 20), Transparency = 0.8}, 10)
            end
        end)
    end
    
    local groundStab = getGroundStabilizer()
    if groundStab then
        task.spawn(function()
            local core = groundStab:FindFirstChild("EmitterCore")
            if core then
                local glow = core:FindFirstChild("EmitterGlow") or core:FindFirstChildWhichIsA("PointLight")
                if glow then
                    tweenProperty(glow, {Brightness = 4}, 3)
                end
                
                for i = 1, 10 do
                    task.delay(i*0.5, function()
                        local offset = Vector3.new(math.random(-50, 50), math.random(10, 50), math.random(-50, 50))
                        local pos = core.Position + offset
                        local orb = makePart("GroundOrb", Vector3.new(1, 1, 1), Color3.fromRGB(0, 255, 255), Enum.Material.Neon, Enum.PartType.Ball)
                        orb.Position = pos
                        local t = tweenProperty(orb, {Position = core.Position}, 2, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
                        t.Completed:Connect(function() orb:Destroy() end)
                    end)
                end
            end
        end)
    end
    
    task.wait(10)
end

local function phase3()
    print("[LiveEvent] Phase 3: Beam Firing")
    EventShake:FireAllClients(10, 10)
    EventColorShift:FireAllClients(Color3.fromRGB(150, 50, 200), 10)
    
    local stabilizers = getStabilizers()
    local phase3Duration = 10
    local isPhase3 = true
    
    for _, stab in ipairs(stabilizers) do
        task.spawn(function()
            local emitter = stab:FindFirstChild("Emitter")
            if emitter then
                local layers = {
                    {color = Color3.fromRGB(255, 100, 200), diameter = 8},
                    {color = Color3.fromRGB(150, 30, 180), diameter = 6},
                    {color = Color3.fromRGB(255, 50, 150), diameter = 4},
                    {color = Color3.fromRGB(255, 255, 255), diameter = 2}
                }
                local beams = createBeam(emitter.Position, FOCAL_POS, layers)
                
                -- Rings
                task.spawn(function()
                    for r = 1, 4 do
                        for i = 1, 3 do
                            local ring = makePart("EnergyRing", Vector3.new(1, 10, 10), Color3.fromRGB(255, 100, 200), Enum.Material.Neon, Enum.PartType.Cylinder)
                            ring.CFrame = CFrame.lookAt(emitter.Position, FOCAL_POS) * CFrame.Angles(0, math.pi/2, 0)
                            local t = tweenProperty(ring, {Position = FOCAL_POS}, 2, Enum.EasingStyle.Linear)
                            t.Completed:Connect(function() ring:Destroy() end)
                            task.wait(2/3)
                        end
                    end
                end)
                
                -- Lightning
                task.spawn(function()
                    while isPhase3 do
                        local parts1 = createLightningBolt(emitter.Position, FOCAL_POS, Color3.fromRGB(255, 100, 255), 10, 15)
                        local parts2 = createLightningBolt(emitter.Position, FOCAL_POS, Color3.fromRGB(200, 200, 255), 10, 15)
                        task.wait(0.5)
                        for _, p in ipairs(parts1) do p:Destroy() end
                        for _, p in ipairs(parts2) do p:Destroy() end
                    end
                end)
            end
        end)
    end
    
    local groundStab = getGroundStabilizer()
    if groundStab then
        local core = groundStab:FindFirstChild("EmitterCore")
        if core then
            local layers = {
                {color = Color3.fromRGB(255, 255, 255), diameter = 6},
                {color = Color3.fromRGB(0, 255, 255), diameter = 4},
                {color = Color3.fromRGB(150, 0, 255), diameter = 2}
            }
            createBeam(core.Position, FOCAL_POS, layers)
        end
    end
    
    task.wait(phase3Duration)
    isPhase3 = false
end

local function phase4()
    print("[LiveEvent] Phase 4: Zero Point Breach")
    EventShake:FireAllClients(15, 17)
    EventFlash:FireAllClients()
    
    -- Rift Sphere
    local rift = makePart("RiftSphere", Vector3.new(4, 4, 4), Color3.fromRGB(255, 255, 255), Enum.Material.Neon, Enum.PartType.Ball)
    rift.Position = FOCAL_POS
    local riftLight = Instance.new("PointLight")
    riftLight.Range = 120
    riftLight.Brightness = 3
    riftLight.Color = Color3.fromRGB(0, 255, 255)
    riftLight.Parent = rift
    tweenProperty(rift, {Size = Vector3.new(80, 80, 80), Transparency = 0.2, Color = Color3.fromRGB(0, 255, 255)}, 3)
    
    -- Orbiting Hexagons
    task.spawn(function()
        local fragments = {}
        for i = 1, 10 do
            local frag = makePart("ShieldFragment", Vector3.new(0.5, 12, 12), Color3.fromRGB(150, 200, 255), Enum.Material.ForceField, Enum.PartType.Cylinder)
            frag.Transparency = 0.3
            table.insert(fragments, {part = frag, angle = (math.pi * 2 / 10) * i})
        end
        
        local startTime = tick()
        while tick() - startTime < 17 do
            local dt = game:GetService("RunService").Heartbeat:Wait()
            local t = tick()
            for _, item in ipairs(fragments) do
                item.angle = item.angle + math.rad(45) * dt
                local offset = Vector3.new(math.cos(item.angle) * 50, math.sin(t * 2 + item.angle)*10, math.sin(item.angle) * 50)
                item.part.CFrame = CFrame.new(FOCAL_POS + offset, FOCAL_POS) * CFrame.Angles(t, t, 0)
            end
        end
        for _, item in ipairs(fragments) do item.part:Destroy() end
    end)
    
    -- Radial Ground Beams
    for i = 1, 16 do
        local angle = (math.pi * 2 / 16) * i
        local beam = makePart("GroundBeam", Vector3.new(400, 3, 3), Color3.fromRGB(255, 50, 200), Enum.Material.Neon, Enum.PartType.Block)
        local dir = Vector3.new(math.cos(angle), 0, math.sin(angle))
        beam.CFrame = CFrame.new(Vector3.new(0, 2, 0) + dir * 200, Vector3.new(0, 2, 0) + dir * 400)
        
        local plight = Instance.new("PointLight", beam)
        plight.Range = 20
        plight.Color = Color3.fromRGB(255, 50, 200)
        
        tweenProperty(beam, {Transparency = 0.3}, 1, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, 16, true)
    end
    
    -- Sky Lightning
    task.spawn(function()
        for i = 1, math.floor(17/0.3) do
            local angle = math.random() * math.pi * 2
            local dist = math.random(50, 300)
            local targetPos = Vector3.new(math.cos(angle) * dist, 0, math.sin(angle) * dist)
            local color = (i % 2 == 0) and Color3.fromRGB(255, 255, 255) or Color3.fromRGB(180, 50, 255)
            local bolts = createLightningBolt(FOCAL_POS, targetPos, color, 8, 20)
            
            task.spawn(function()
                task.wait(0.3)
                for _, b in ipairs(bolts) do
                    tweenProperty(b, {Transparency = 1}, 0.2).Completed:Connect(function() b:Destroy() end)
                end
            end)
            task.wait(0.3)
        end
    end)
    
    -- Lava Cracks
    for i = 1, 30 do
        local angle = math.random() * math.pi * 2
        local dist = math.random(20, 400)
        local length = math.random(50, 200)
        local pos = Vector3.new(math.cos(angle) * dist, 1, math.sin(angle) * dist)
        
        local color = Color3.fromRGB(math.random(255, 255), math.random(150, 220), math.random(30, 50))
        local crack = makePart("LavaCrack", Vector3.new(length, 2, 2), color, Enum.Material.Neon, Enum.PartType.Block)
        crack.CFrame = CFrame.new(pos) * CFrame.Angles(0, math.random() * math.pi * 2, 0)
        crack.Transparency = 0.3
        
        tweenProperty(crack, {Transparency = 0}, 1, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, 16, true)
    end
    
    -- Dark Orb
    local orbPos = Vector3.new(0, 400, 0)
    local darkOrb = makePart("DarkOrb", Vector3.new(15, 15, 15), Color3.fromRGB(20, 10, 30), Enum.Material.Neon, Enum.PartType.Ball)
    darkOrb.Position = orbPos
    
    local purpleAura = makePart("PurpleAura", Vector3.new(25, 25, 25), Color3.fromRGB(150, 50, 255), Enum.Material.Neon, Enum.PartType.Ball)
    purpleAura.Position = orbPos
    purpleAura.Transparency = 0.4
    tweenProperty(purpleAura, {Transparency = 0.7}, 1.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, 11, true)
    
    local orangeAura = makePart("OrangeAura", Vector3.new(35, 35, 35), Color3.fromRGB(255, 150, 0), Enum.Material.Neon, Enum.PartType.Ball)
    orangeAura.Position = orbPos
    orangeAura.Transparency = 0.6
    tweenProperty(orangeAura, {Transparency = 0.8}, 2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, 8, true)
    
    task.wait(17)
end

local function phase5()
    print("[LiveEvent] Phase 5: Climax")
    EventShake:FireAllClients(25, 5)
    EventFlash:FireAllClients()
    EventColorShift:FireAllClients(Color3.fromRGB(180, 50, 255), 8)
    
    -- Flash Sphere
    local flash = makePart("FlashSphere", Vector3.new(1, 1, 1), Color3.fromRGB(255, 255, 255), Enum.Material.Neon, Enum.PartType.Ball)
    flash.Position = FOCAL_POS
    local flashLight = Instance.new("PointLight", flash)
    flashLight.Brightness = 10
    flashLight.Range = 200
    
    tweenProperty(flash, {Size = Vector3.new(600, 600, 600), Transparency = 1}, 1.5)
    tweenProperty(flashLight, {Brightness = 0}, 1.5)
    
    -- Shockwaves
    task.spawn(function()
        for i = 1, 5 do
            local ring = makePart("Shockwave", Vector3.new(2, 10, 10), Color3.fromRGB(255, 255, 255), Enum.Material.ForceField, Enum.PartType.Cylinder)
            ring.CFrame = CFrame.new(FOCAL_POS) * CFrame.Angles(0, 0, math.pi/2)
            ring.Transparency = 0.3
            tweenProperty(ring, {Size = Vector3.new(2, 800, 800), Transparency = 1, Color = Color3.fromRGB(150, 0, 255)}, 3)
            task.wait(0.3)
        end
    end)
    
    -- Sky Rift
    local riftLayers = {
        {size = Vector3.new(5, 40, 40), mat = Enum.Material.ForceField, col = Color3.fromRGB(200, 220, 255), trans = 0},
        {size = Vector3.new(3, 60, 60), mat = Enum.Material.Neon, col = Color3.fromRGB(150, 30, 200), trans = 0.3},
        {size = Vector3.new(2, 80, 80), mat = Enum.Material.Neon, col = Color3.fromRGB(255, 80, 180), trans = 0.5}
    }
    
    for _, ld in ipairs(riftLayers) do
        local l = makePart("SkyRiftLayer", ld.size, ld.col, ld.mat, Enum.PartType.Cylinder)
        l.CFrame = CFrame.new(FOCAL_POS) * CFrame.Angles(math.pi/2, 0, 0)
        l.Transparency = ld.trans
        
        task.spawn(function()
            local t = tick()
            while true do
                local dt = game:GetService("RunService").Heartbeat:Wait()
                t = t + dt
                l.CFrame = CFrame.new(FOCAL_POS) * CFrame.Angles(math.pi/2, t * 0.5, 0)
            end
        end)
    end
    
    -- Lightning Burst
    for i = 1, 30 do
        local dir = Vector3.new(math.random()-0.5, math.random()-0.5, math.random()-0.5).Unit
        local dist = math.random(100, 200)
        local bolts = createLightningBolt(FOCAL_POS, FOCAL_POS + dir * dist, Color3.fromRGB(255, 255, 255), 5, 10)
        task.spawn(function()
            for _, b in ipairs(bolts) do
                tweenProperty(b, {Transparency = 1}, 1).Completed:Connect(function() b:Destroy() end)
            end
        end)
    end
    
    -- Debris
    local colors = {
        Color3.fromRGB(150, 30, 200), Color3.fromRGB(255, 50, 200),
        Color3.fromRGB(0, 255, 255), Color3.fromRGB(255, 255, 255),
        Color3.fromRGB(255, 150, 0)
    }
    for i = 1, 60 do
        local size = math.random(2, 5)
        local deb = makePart("Debris", Vector3.new(size, size, size), colors[math.random(1, #colors)], Enum.Material.Neon, Enum.PartType.Block)
        deb.Position = FOCAL_POS
        
        local dir = Vector3.new(math.random()-0.5, math.random()-0.5, math.random()-0.5).Unit
        local target = FOCAL_POS + dir * math.random(100, 300) - Vector3.new(0, 100, 0)
        
        local dur = math.random(30, 50)/10
        local tw = tweenProperty(deb, {Position = target, Transparency = 1}, dur, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
        tw.Completed:Connect(function() deb:Destroy() end)
    end
    
    -- Atmosphere
    task.spawn(function()
        tweenProperty(Lighting, {ClockTime = 4}, 5)
        
        local cc = Lighting:FindFirstChild("EventCC") or Lighting:FindFirstChildWhichIsA("ColorCorrectionEffect")
        if cc then
            tweenProperty(cc, {Brightness = -0.1, Saturation = -0.2}, 5)
        end
        
        local atm = Lighting:FindFirstChild("EventAtmosphere") or Lighting:FindFirstChildWhichIsA("Atmosphere")
        if atm then
            tweenProperty(atm, {Decay = Color3.fromRGB(80, 20, 60)}, 5)
        end
        
        local bloom = Lighting:FindFirstChild("EventBloom") or Lighting:FindFirstChildWhichIsA("BloomEffect")
        if bloom then
            tweenProperty(bloom, {Intensity = 3, Threshold = 0.5}, 5)
        end
    end)
    
    task.wait(20)
    print("[LiveEvent] Event Complete")
end

local function startEvent()
    phase1()
    phase2()
    phase3()
    phase4()
    phase5()
end

task.delay(5, startEvent)
