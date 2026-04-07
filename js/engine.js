export const DOME_RADIUS = 140;
export const CENTER = { x: DOME_RADIUS, y: DOME_RADIUS };
export const BALL_RADIUS = 10;

export class MiniBall {
    constructor(num, color, options = {}) {
        this.num = num;
        this.radius = options.radius || BALL_RADIUS;
        this.color = color;
        this.isExited = false;
        this.isPowerball = options.isPowerball || false;

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (DOME_RADIUS - this.radius - 20);
        this.x = CENTER.x + Math.cos(angle) * dist;
        this.y = CENTER.y + Math.sin(angle) * dist;

        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        
        this.friction = 0.998;
        this.elasticity = 0.9;
        this.mass = 1;
    }

    update(isMixing) {
        if (this.isExited) return;
        const gravity = isMixing ? 0.05 : 0.25;
        this.vy += gravity;

        if (isMixing) {
            const dx = this.x - CENTER.x;
            const dy = this.y - CENTER.y;
            this.vx += (Math.random() - 0.5) * 2 - (dy / 100);
            this.vy += (Math.random() - 0.5) * 2 + (dx / 100);
            
            const maxSpeed = 15;
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;

        const dx = this.x - CENTER.x;
        const dy = this.y - CENTER.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > DOME_RADIUS - this.radius) {
            const nx = dx / dist;
            const ny = dy / dist;
            const vDotN = this.vx * nx + this.vy * ny;
            if (vDotN > 0) {
                this.vx -= (1 + this.elasticity) * vDotN * nx;
                this.vy -= (1 + this.elasticity) * vDotN * ny;
                const overlap = dist - (DOME_RADIUS - this.radius);
                this.x -= nx * overlap;
                this.y -= ny * overlap;
            }
        }
    }

    draw(ctx) {
        if (this.isExited) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            this.x - this.radius*0.3, this.y - this.radius*0.3, this.radius*0.1,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, "white");
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, "rgba(0,0,0,0.3)");
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.fillStyle = (this.color === '#ffffff') ? "black" : "white";
        ctx.font = `bold ${this.radius * 0.9}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.num, this.x, this.y + 1);
        ctx.restore();
    }
}

export function resolveCollisions(balls) {
    for (let i = 0; i < balls.length; i++) {
        if (balls[i].isExited) continue;
        for (let j = i + 1; j < balls.length; j++) {
            if (balls[j].isExited) continue;
            const b1 = balls[i];
            const b2 = balls[j];
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = b1.radius + b2.radius;
            if (dist < minDist) {
                const nx = dx / dist;
                const ny = dy / dist;
                const vRelativeX = b1.vx - b2.vx;
                const vRelativeY = b1.vy - b2.vy;
                const vDotN = vRelativeX * nx + vRelativeY * ny;
                if (vDotN > 0) {
                    const impulse = (2 * vDotN) / (b1.mass + b2.mass);
                    b1.vx -= impulse * b2.mass * nx * b1.elasticity;
                    b1.vy -= impulse * b2.mass * ny * b1.elasticity;
                    b2.vx += impulse * b1.mass * nx * b2.elasticity;
                    b2.vy += impulse * b1.mass * ny * b2.elasticity;
                }
                const overlap = minDist - dist;
                b1.x -= nx * (overlap / 2);
                b1.y -= ny * (overlap / 2);
                b2.x += nx * (overlap / 2);
                b2.y += ny * (overlap / 2);
            }
        }
    }
}
