# StarMaze — Gameplay Guide

## Overview

StarMaze is a top-down arcade shooter set in procedurally generated mazes. Your goal is to pilot a ship through the maze, collect every star, and reach the exit portal — all while fighting off patrolling enemies. Each level increases the maze size and enemy count.

## Official Description

In the year 2891, explorers have discovered an alien artifact of immense power. Hidden within the Star Maze are jewels of immense power. Powerful aliens guard these crystals of pure energy, intent on keeping them safe. The discoverers of the the Star Maze, unwilling to risk their own life and limb, have traveled back almost 1000 years to the year 1981, and have published a simulation of the Star Maze. Now these visitors from the future await the player who achieves the highest score, to use their space fighting prowess to acquire the crystals.

In Star Maze, the player controls a small ship which can rotate 360 degrees, always firing from the forward cannons. The player can accelerate depending on the direction they are facing. The goal is to collect 9 jewels from the maze to complete a level, while avoiding or destroying enemy ships. The player has rapidly depleting fuel stores, and must gather resources as they explore. If the player is struck by alien fire, they are destroyed. The player starts with a total of 3 ships, and if all are lost, it's game over.

## Controls

| Action | Keys |
|---|---|
| Rotate left | Left Arrow / A |
| Rotate right | Right Arrow / D |
| Thrust forward | Up Arrow / W |
| Fire | Spacebar |

The ship has inertia — it continues drifting after you stop thrusting. Use thrust in the opposite direction or let drag slow you down.

---

## Objective

1. **Collect all stars** scattered throughout the maze.
2. **Reach the exit portal** once every star has been collected.
3. **Survive** enemy fire and collisions along the way.

The exit portal is faint and locked until all stars are collected. Once you pick up the last star, the portal glows bright cyan and a message appears: **"ALL STARS! FIND THE EXIT!"**

---

## Game Objects

### Player Ship (Green Triangle)

Your ship. Rotates, thrusts, and fires bullets. Starts each game with **3 lives** and a **shield** that can absorb 2 hits.

- A visible thrust flame appears behind the ship when accelerating.
- On death, the ship explodes and respawns at the safest location in the maze (farthest from enemies) with temporary invulnerability (2.5 seconds of blinking).

### Stars (Yellow, Floating)

Collectible items placed at dead-end corridors in the maze. Each level has **8 + (2 x level)** stars. All must be collected to unlock the exit.

- Stars float gently up and down and rotate continuously.
- Collecting a star triggers a flash and scale-up animation.

### Exit Portal (Cyan Rings)

Located at the farthest point in the maze from your starting position.

- **Locked:** Appears faint (30% opacity) while stars remain.
- **Unlocked:** Glows fully bright after all stars are collected. Pulses when activated.
- Touching the unlocked portal completes the level.

### Enemies (Red Diamonds)

Hostile ships that patrol the maze corridors.

- **Patrol mode:** Wander in random cardinal directions, changing course every 2 seconds or when hitting a wall.
- **Chase mode:** If you come within **250 pixels** and the enemy has line-of-sight (no walls blocking), it chases you at nearly double patrol speed and fires red bullets at you.
- Enemies collide with walls and with each other.

### Player Bullets (Light Green)

Fired from the front of your ship.

- Can **bounce once** off walls, allowing trick shots around corners.
- Maximum of 20 bullets on screen at once.
- Auto-expire after 1.2 seconds.

### Enemy Bullets (Light Red)

Fired by enemies when they detect you.

- **Do not bounce** — they are destroyed on contact with walls.
- Same speed and lifespan as player bullets.

### Shield Gems (Blue Diamonds)

Found at fixed locations in the maze (3 per level) and also dropped by destroyed enemies.

- Restores your shield to full strength (2 HP).
- Displays **"SHIELD RESTORED!"** when collected.

### Life Gems (Green Ship Icon)

Dropped by destroyed enemies (less common than shield gems).

- Grants **+1 extra life**.
- Displays **"EXTRA LIFE!"** when collected.

---

## Shield System

Your ship starts each life with a shield that absorbs damage before you lose a life.

| Shield State | HP | Visual | HUD Display |
|---|---|---|---|
| Full | 2/2 | Blue circle around ship | Blue bar (full) |
| Damaged | 1/2 | Orange circle with cracks | Orange bar (half) |
| Down | 0/2 | No shield visible | Red **"SHIELD: DOWN"** |

- Each hit from an enemy bullet or enemy collision reduces shield HP by 1.
- When the shield breaks (0 HP), a shattering particle effect plays.
- The next hit after the shield is down **costs a life**.
- Picking up a Shield Gem restores the shield to 2/2.
- After losing a life and respawning, your shield is fully restored.

---

## Scoring

| Action | Points |
|---|---|
| Collect a star | **100** |
| Destroy an enemy | **250** |
| Collect an extra life gem | **200** |
| Collect a shield gem | **50** |

- Your score carries over between levels when you win.
- Your score resets to 0 on game over.

### Enemy Drops

When you destroy an enemy, there is a **20% chance** it drops a gem:

- **70%** of drops are Shield Gems
- **30%** of drops are Life Gems

Overall per enemy killed: 14% chance of a shield gem, 6% chance of a life gem.

---

## Levels and Difficulty

### Level Progression

| Level | Maze Size (cells) | Enemy Count | Star Count |
|---|---|---|---|
| 1 | 12 x 12 | 6 | 10 |
| 2 | 12 x 12 | 7 | 12 |
| 3 | 12 x 12 | 8 | 14 |
| 4 | 13 x 13 | 9 | 16 |
| 5 | 13 x 13 | 10 | 18 |
| 6 | 13 x 13 | 11 | 20 |
| 7 | 14 x 14 | 12 | 22 |
| ... | +1 every 3 levels | +1 per level | +2 per level |

- The maze grows by 1 cell in each dimension every 3 levels.
- One additional enemy spawns each level.
- Two more stars are added each level.

### What Carries Over Between Levels

- **Score** — keeps accumulating
- **Lives** — carry over (including any extras earned)

### What Resets Each Level

- Shield restored to full
- New maze generated
- Fresh enemies, stars, and gems placed

---

## Win and Lose Conditions

### Level Complete (Win)

Collect **every star** in the maze, then touch the **exit portal**. The screen displays **"MAZE CLEARED!"** with your score. Press **Space** to advance to the next level.

### Game Over (Lose)

Lose all your **lives**. The screen displays **"GAME OVER"** with your final score and the level you reached. Press **Space** to restart from level 1 with a score of 0.

---

## HUD (Heads-Up Display)

The HUD is always visible during gameplay:

| Position | Element | Details |
|---|---|---|
| Top-left | **SCORE** | Current point total |
| Top-left (below score) | **STARS** | Collected / total (e.g. "3/10") |
| Top-center | **LEVEL** | Current level number |
| Top-right | **LIVES** | Triangle icons per life (turns red at 1 life) |
| Top-right (below lives) | **SHIELD** | Bar showing shield HP |
| Bottom-right | **Minimap** | 140x140px overview of the full maze |

The minimap shows the entire maze, your position, enemies, stars, and the exit portal.

---

## Tips

- **Use wall bounces.** Your bullets ricochet once off walls — use this to hit enemies around corners where they can't shoot back.
- **Break line of sight.** Enemies only chase and shoot when they can see you. Duck behind walls to lose them.
- **Prioritize shield gems.** Keeping your shield up effectively gives you 2 extra hits per life.
- **Check the minimap.** It shows the full maze layout and remaining stars so you can plan your route.
- **Clear enemies near stars.** Don't rush into a dead-end to grab a star if an enemy is patrolling nearby.
- **Manage your approach to the exit.** Once all stars are collected, the exit portal activates — plan your path there before grabbing the last star.
- **Enemies get denser.** In later levels, conserve lives and shield gems for harder sections of the maze.

## Original Game Credits

**Programmed by** Gordon Eastman
**Original game design by** Robert J. Woodhead
**Cover design by**	Rick Austin

## Other Credits / Details (Wikipedia)
**Developer**	Eastman Computing
**Publisher**	Sir-Tech
**Designer**	Robert Woodhead
**Programmer**	Gordon Eastman
**Platforms**	Apple II, Atari 8-bit, Commodore 64
**Release**	1982: Apple / 1983: Atari, C64
**Genre**	Multidirectional shooter
**Mode**	Single-player