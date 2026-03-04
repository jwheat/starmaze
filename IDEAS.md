# StarMaze — Feature Ideas

## From the Original Game Design

### Fuel System
The original game description mentions "rapidly depleting fuel stores" and gathering resources. This is the biggest missing piece relative to the original design.

- Thrusting consumes fuel over time
- Fuel pickups spawn throughout the maze (dead-end cells, enemy drops)
- Running out of fuel disables thrust — the ship drifts on inertia only
- HUD fuel gauge (bar or numeric display)
- Low fuel warning (flashing indicator, color change)
- Adds a strategic layer: players must balance exploration vs. conservation and can't freely backtrack

## Gameplay Depth

### Enemy Variety
Currently all enemies behave identically. Adding distinct types would make encounters less predictable.

- **Turret** — Stationary, higher fire rate, guards key locations
- **Speeder** — Fast patrol, doesn't shoot, damages on collision
- **Stalker** — Follows walls, longer detection range, slower fire rate
- **Heavy** — Slow, takes multiple hits to destroy, higher point value

### Power-Ups
Temporary abilities that reward exploration and add tactical options.

- **Rapid Fire** — Doubled fire rate for a limited time
- **Speed Boost** — Increased max speed and thrust
- **Penetrating Shots** — Bullets pass through walls instead of bouncing
- **Magnet** — Stars are attracted toward the ship within a radius
- Visual indicator on ship and HUD timer showing remaining duration

### Score Multiplier / Combo System
Reward skillful play with bonus points.

- Killing multiple enemies in quick succession increases a multiplier
- Collecting stars without taking damage builds a streak bonus
- Combo counter displayed on HUD, resets on damage taken
- End-of-level bonuses for no-damage clears or speed completions

### High Score Persistence
Give players something to chase across sessions.

- Save top scores to localStorage
- High score table on the game over screen (top 10)
- Display current high score on HUD during gameplay
- Track best level reached alongside score

## Polish and Feel

### Sound Design
The game has a few procedural Web Audio sounds but no comprehensive audio.

- **Background music** — Synthesized ambient or retro chiptune track, per-level or looping
- **Thrust sound** — Low hum or engine noise while accelerating
- **Star pickup chime** — Ascending tone on collection
- **Enemy alert** — Audio cue when an enemy spots the player
- **Portal activation** — Sound when all stars collected and exit unlocks
- **Level complete fanfare** — Short victory jingle

### Screen Shake
Brief camera shake effects for impact and intensity.

- On taking damage (small shake)
- On ship explosion (larger shake)
- On enemy destruction (subtle shake)
- Configurable intensity, should be short (100-300ms)

### Particle Trails
Visual trails to enhance the sense of movement.

- Faint exhaust trail behind the ship while thrusting
- Subtle trail behind enemies while patrolling/chasing
- Star sparkle particles near collectibles
- Exit portal ambient particles when active

## Level Design

### Bonus Rooms / Secret Passages
Hidden areas that reward thorough exploration.

- Occasionally generate a concealed passage (breakable wall or hidden door)
- Bonus room contains extra stars, gems, or a unique power-up
- Visual hint near the entrance (slightly different wall color or a marking)
- Not required for level completion but valuable for score chasers

### Boss Enemies
A tougher challenge every few levels.

- Appears every 3-5 levels
- Larger sprite, more HP, unique attack pattern
- Guards the exit portal or a cluster of stars
- Higher point value on defeat
- Could drop a guaranteed power-up or extra life

### Timed Bonus
Add urgency and reward fast play.

- Par time displayed at level start
- Completing under par awards bonus points
- Optional visible timer on HUD (or just revealed at level end)
- No penalty for going over — purely a bonus incentive
