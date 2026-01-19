const fs = require('fs');
const path = require('path');

// Helper to create a 32x32 PNG buffer with a specific color
function createPngBuffer(r, g, b) {
    // This is a very raw construction of a PNG file for a solid color
    // It's better to just use a known base64 string for a simple dot/square to avoid complex encoding logic
    // Using a 1x1 pixel base64 and repeating it is easier
    
    // 1x1 Red pixel
    // iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==
    
    // For simplicity, I will write the same placeholder icon for all, 
    // user can replace them later.
    const base64Icon = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAALUlEQVRYR+3QQREAAAgCQfZvrWdQEhzuTA72XAIECBAgQIAAAQIECBAgQIDABW6xGQl51i8QAAAAAElFTkSuQmCC'; // Transparent 32x32
    
    // Actually, let's use a colored one so they can see it.
    // Blue-ish 32x32
    const coloredIcon = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAQklEQVRYR+3QwQkAMAgDQfZf2js4Qj51C/IeMxB2Vx07u+rY8QIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEygV8nEAQ8nO92gAAAABJRU5ErkJggg==';

    return Buffer.from(coloredIcon, 'base64');
}

const icons = ['meeting', 'meeting_active', 'ai', 'ai_active', 'history', 'history_active', 'profile', 'profile_active'];
const destDir = path.join(__dirname, 'assets/images');

icons.forEach(name => {
    fs.writeFileSync(path.join(destDir, `${name}.png`), createPngBuffer());
});

console.log('Icons generated.');
