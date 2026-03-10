#!/usr/bin/env python3
"""
Extract dominant colors from Stardew Valley placeable item icons.
Only includes items that can be physically placed on the farm.
Reads PNGs from apps/web/public/icons/items/ and outputs palette JSON.
"""

import json
import math
import os
from collections import Counter
from pathlib import Path

from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent.parent
ICONS_DIR = REPO_ROOT / "apps" / "web" / "public" / "icons" / "items"
SEED_DIR = REPO_ROOT / "packages" / "db" / "seed-data" / "items"
OUTPUT_FILE = SCRIPT_DIR.parent / "src" / "palette-data.json"

# ─── Curated list of PLACEABLE items ───────────────────────────────────────
# These are items confirmed to be placeable on the farm ground in vanilla
# Stardew Valley 1.6. Organized by category.

PLACEABLE_ITEMS = {
    # ── Flooring / Paths (all craftable, cheap, 1x1) ──
    "flooring": {
        "difficulty": "easy",
        "items": [
            ("Wood Floor", "Craft: 1 Wood"),
            ("Rustic Plank Floor", "Craft: 1 Wood"),
            ("Straw Floor", "Craft: 1 Wood, 1 Fiber"),
            ("Weathered Floor", "Craft: 1 Wood"),
            ("Crystal Floor", "Craft: 1 Refined Quartz"),
            ("Stone Floor", "Craft: 1 Stone"),
            ("Stone Walkway Floor", "Craft: 1 Stone"),
            ("Brick Floor", "Craft: 2 Clay, 5 Stone"),
            ("Wood Path", "Craft: 1 Wood"),
            ("Gravel Path", "Craft: 1 Stone"),
            ("Cobblestone Path", "Craft: 1 Stone"),
            ("Stepping Stone Path", "Craft: 1 Stone"),
            ("Crystal Path", "Craft: 1 Refined Quartz"),
        ],
    },
    # ── Craftable machines & objects (Big Craftables, placed on ground) ──
    "crafting": {
        "items": [
            ("Chest", "easy", "Craft: 50 Wood"),
            ("Stone Chest", "easy", "Craft: 50 Stone"),
            ("Keg", "medium", "Craft: 30 Wood, 1 Copper Bar, 1 Iron Bar, 1 Oak Resin"),
            ("Preserves Jar", "medium", "Craft: 50 Wood, 40 Stone, 8 Coal"),
            ("Cheese Press", "medium", "Craft: 45 Wood, 45 Stone, 10 Hardwood, 1 Copper Bar"),
            ("Mayonnaise Machine", "easy", "Craft: 15 Wood, 15 Stone, 1 Earth Crystal, 1 Copper Bar"),
            ("Loom", "medium", "Craft: 60 Wood, 30 Fiber, 1 Pine Tar"),
            ("Oil Maker", "medium", "Craft: 50 Slime, 20 Hardwood, 1 Gold Bar"),
            ("Seed Maker", "medium", "Craft: 25 Wood, 10 Coal, 1 Gold Bar"),
            ("Bee House", "medium", "Craft: 40 Wood, 8 Coal, 1 Iron Bar, 1 Maple Syrup"),
            ("Furnace", "easy", "Craft: 20 Copper Ore, 25 Stone"),
            ("Recycling Machine", "easy", "Craft: 25 Wood, 25 Stone, 1 Iron Bar"),
            ("Crystalarium", "hard", "Craft: 99 Stone, 5 Gold Bar, 2 Iridium Bar, 1 Battery Pack"),
            ("Lightning Rod", "easy", "Craft: 1 Iron Bar, 1 Refined Quartz, 1 Bat Wing"),
            ("Worm Bin", "medium", "Craft: 25 Hardwood, 1 Gold Bar, 50 Fiber, 1 Iron Bar"),
            ("Tapper", "easy", "Craft: 40 Wood, 2 Copper Bar"),
            ("Heavy Tapper", "hard", "Craft: 30 Hardwood, 1 Radioactive Bar"),
            ("Slime Incubator", "hard", "Craft: 2 Iridium Bar, 100 Slime"),
            ("Slime Egg-Press", "hard", "Craft: 25 Coal, 1 Fire Quartz, 1 Battery Pack"),
            ("Campfire", "easy", "Craft: 10 Stone, 10 Wood, 10 Fiber"),
            ("Torch", "easy", "Craft: 1 Wood, 1 Sap"),
            ("Scarecrow", "easy", "Craft: 50 Wood, 1 Coal, 20 Fiber"),
            ("Deluxe Scarecrow", "hard", "Collect all Rarecrows"),
            ("Garden Pot", "easy", "Given by Evelyn after greenhouse repair"),
            ("Sprinkler", "easy", "Craft: 1 Copper Bar, 1 Iron Bar"),
            ("Quality Sprinkler", "medium", "Craft: 1 Iron Bar, 1 Gold Bar, 1 Refined Quartz"),
            ("Iridium Sprinkler", "hard", "Craft: 1 Gold Bar, 1 Iridium Bar, 1 Battery Pack"),
            ("Crab Pot", "easy", "Craft: 40 Wood, 3 Iron Bar"),
            ("Drum Block", "easy", "Craft: 10 Wood, 2 Copper Ore"),
            ("Flute Block", "easy", "Craft: 10 Wood, 2 Copper Ore"),
            ("Jack-O-Lantern", "easy", "Buy: Spirit's Eve festival"),
            ("Wicked Statue", "medium", "Craft: 25 Stone, 5 Coal"),
            ("Deconstructor", "hard", "Buy from Qi's Walnut Room"),
            ("Mini-Jukebox", "easy", "Craft: 2 Iron Bar, 1 Battery Pack"),
            ("Hopper", "hard", "Buy from Qi's Walnut Room"),
            ("Statue Of Perfection", "hard", "Grandpa's Shrine evaluation"),
            ("Mini-Obelisk", "hard", "Craft: 30 Hardwood, 20 Solar Essence, 3 Gold Bar"),
        ],
    },
    # ── Fences (placed on ground, 1x1) ──
    "misc": {
        "items": [
            ("Wood Fence", "easy", "Craft: 2 Wood"),
            ("Stone Fence", "easy", "Craft: 2 Stone"),
            ("Iron Fence", "medium", "Craft: 1 Iron Bar"),
            ("Hardwood Fence", "medium", "Craft: 1 Hardwood"),
            ("Gate", "easy", "Craft: 10 Wood"),
        ],
    },
    # ── Crops (harvestable items that are visually distinct when held/displayed) ──
    "crop": {
        "items": [
            ("Parsnip", "easy", "Grow: Spring, 4 days"),
            ("Cauliflower", "easy", "Grow: Spring, 12 days"),
            ("Potato", "easy", "Grow: Spring, 6 days"),
            ("Green Bean", "easy", "Grow: Spring, 10 days"),
            ("Kale", "easy", "Grow: Spring, 6 days"),
            ("Garlic", "easy", "Grow: Spring, 4 days"),
            ("Rhubarb", "medium", "Grow: Spring, 13 days"),
            ("Strawberry", "medium", "Grow: Spring, 8 days"),
            ("Coffee Bean", "medium", "Grow: Spring/Summer, 10 days"),
            ("Melon", "easy", "Grow: Summer, 12 days"),
            ("Tomato", "easy", "Grow: Summer, 11 days"),
            ("Blueberry", "easy", "Grow: Summer, 13 days"),
            ("Hot Pepper", "easy", "Grow: Summer, 5 days"),
            ("Radish", "easy", "Grow: Summer, 6 days"),
            ("Red Cabbage", "medium", "Grow: Summer, 9 days"),
            ("Starfruit", "hard", "Grow: Summer, 13 days"),
            ("Corn", "easy", "Grow: Summer/Fall, 14 days"),
            ("Hops", "easy", "Grow: Summer, 11 days"),
            ("Wheat", "easy", "Grow: Summer/Fall, 4 days"),
            ("Poppy", "easy", "Grow: Summer, 7 days"),
            ("Summer Spangle", "easy", "Grow: Summer, 8 days"),
            ("Sunflower", "easy", "Grow: Summer/Fall, 8 days"),
            ("Eggplant", "easy", "Grow: Fall, 5 days"),
            ("Pumpkin", "easy", "Grow: Fall, 13 days"),
            ("Yam", "easy", "Grow: Fall, 10 days"),
            ("Cranberries", "easy", "Grow: Fall, 7 days"),
            ("Beet", "medium", "Grow: Fall, 6 days"),
            ("Amaranth", "easy", "Grow: Fall, 7 days"),
            ("Grape", "easy", "Grow: Fall, 10 days"),
            ("Artichoke", "medium", "Grow: Fall, 8 days"),
            ("Bok Choy", "easy", "Grow: Fall, 4 days"),
            ("Fairy Rose", "easy", "Grow: Fall, 12 days"),
            ("Sweet Gem Berry", "hard", "Grow: Fall, 24 days"),
            ("Ancient Fruit", "hard", "Grow: Spring, 28 days + regrow"),
            ("Tulip", "easy", "Grow: Spring, 6 days"),
            ("Blue Jazz", "easy", "Grow: Spring, 7 days"),
            ("Rice", "easy", "Grow: Spring, 8 days"),
            ("Tea Leaves", "medium", "Tea Sapling harvest"),
            ("Cactus Fruit", "medium", "Greenhouse cactus"),
            ("Pineapple", "hard", "Grow: Ginger Island, 14 days"),
            ("Taro Root", "hard", "Grow: Ginger Island, 10 days"),
            ("Qi Fruit", "hard", "Grow: Qi's crop challenge"),
        ],
    },
    # ── Minerals & Gems (can be placed on tables, ground with mods, or displayed) ──
    "mineral": {
        "items": [
            ("Quartz", "easy", "Mine floors 1-120"),
            ("Amethyst", "easy", "Mine floors 1-40, Geodes"),
            ("Aquamarine", "medium", "Mine floors 41-80"),
            ("Diamond", "hard", "Mine floors 50+"),
            ("Emerald", "medium", "Mine floors 81-120"),
            ("Ruby", "medium", "Mine floors 81-120"),
            ("Topaz", "easy", "Mine floors 1-40"),
            ("Jade", "medium", "Mine floors 41-80"),
            ("Earth Crystal", "easy", "Mine floors 1-39, Geodes"),
            ("Frozen Tear", "easy", "Mine floors 41-79"),
            ("Fire Quartz", "easy", "Mine floors 81-119"),
            ("Prismatic Shard", "hard", "Rare drop, Skull Cavern"),
            ("Copper Ore", "easy", "Mine floors 1-40"),
            ("Iron Ore", "easy", "Mine floors 41-80"),
            ("Gold Ore", "medium", "Mine floors 81-120"),
            ("Iridium Ore", "hard", "Skull Cavern"),
            ("Copper Bar", "easy", "Smelt: 5 Copper Ore"),
            ("Iron Bar", "medium", "Smelt: 5 Iron Ore"),
            ("Gold Bar", "medium", "Smelt: 5 Gold Ore"),
            ("Iridium Bar", "hard", "Smelt: 5 Iridium Ore"),
            ("Radioactive Bar", "hard", "Smelt: 5 Radioactive Ore"),
            ("Marble", "easy", "Frozen Geode"),
            ("Sandstone", "easy", "Geode"),
            ("Granite", "easy", "Geode"),
            ("Basalt", "easy", "Magma Geode"),
            ("Limestone", "easy", "Geode"),
            ("Mudstone", "easy", "Geode"),
            ("Obsidian", "medium", "Magma Geode"),
            ("Slate", "easy", "Geode"),
            ("Fairy Stone", "easy", "Frozen Geode"),
            ("Star Shards", "medium", "Magma Geode"),
            ("Ocean Stone", "easy", "Frozen Geode"),
            ("Pyrite", "easy", "Frozen Geode"),
            ("Lemon Stone", "easy", "Magma Geode"),
            ("Neptunite", "medium", "Magma Geode"),
            ("Malachite", "easy", "Geode"),
            ("Orpiment", "easy", "Geode"),
            ("Petrified Slime", "easy", "Geode"),
            ("Helvite", "medium", "Magma Geode"),
            ("Jasper", "easy", "Geode"),
            ("Opal", "easy", "Frozen Geode"),
            ("Aerinite", "easy", "Frozen Geode"),
            ("Calcite", "easy", "Geode"),
            ("Dolomite", "easy", "Magma Geode"),
            ("Esperite", "easy", "Frozen Geode"),
            ("Fluorapatite", "easy", "Frozen Geode"),
            ("Geminite", "easy", "Frozen Geode"),
            ("Bixite", "medium", "Magma Geode"),
            ("Baryte", "easy", "Geode"),
            ("Ghost Crystal", "easy", "Frozen Geode"),
            ("Tigerseye", "easy", "Magma Geode"),
            ("Jamborite", "easy", "Geode"),
            ("Celestine", "easy", "Geode"),
            ("Alamite", "easy", "Geode"),
            ("Kyanite", "easy", "Frozen Geode"),
            ("Jagoite", "easy", "Geode"),
            ("Lunarite", "easy", "Frozen Geode"),
            ("Thunder Egg", "easy", "Geode"),
            ("Nekoite", "easy", "Geode"),
        ],
    },
    # ── Artisan goods (placed on ground) ──
    "artisan": {
        "items": [
            ("Honey", "medium", "Bee House output"),
            ("Wine", "medium", "Keg: any fruit"),
            ("Pale Ale", "medium", "Keg: Hops"),
            ("Beer", "medium", "Keg: Wheat"),
            ("Juice", "medium", "Keg: any vegetable"),
            ("Pickles", "medium", "Preserves Jar: any vegetable"),
            ("Jelly", "medium", "Preserves Jar: any fruit"),
            ("Cheese", "medium", "Cheese Press: Milk"),
            ("Goat Cheese", "medium", "Cheese Press: Goat Milk"),
            ("Cloth", "medium", "Loom: Wool"),
            ("Mayonnaise", "easy", "Mayonnaise Machine: Egg"),
            ("Duck Mayonnaise", "medium", "Mayonnaise Machine: Duck Egg"),
            ("Truffle Oil", "hard", "Oil Maker: Truffle"),
            ("Oil", "medium", "Oil Maker: Corn/Sunflower"),
            ("Maple Syrup", "easy", "Tapper on Maple Tree"),
            ("Oak Resin", "easy", "Tapper on Oak Tree"),
            ("Pine Tar", "easy", "Tapper on Pine Tree"),
        ],
    },
    # ── Resources (can be placed on ground/displayed) ──
    "resource": {
        "items": [
            ("Wood", "easy", "Chop trees"),
            ("Stone", "easy", "Break rocks"),
            ("Coal", "easy", "Mine: all floors"),
            ("Fiber", "easy", "Cut weeds"),
            ("Hardwood", "medium", "Chop: stumps, Mahogany"),
            ("Sap", "easy", "Chop trees"),
            ("Clay", "easy", "Dig: Hoe on ground"),
            ("Bone Fragment", "easy", "Kill: Skeletons"),
            ("Bat Wing", "easy", "Kill: Bats"),
            ("Bug Meat", "easy", "Kill: Bugs"),
            ("Slime", "easy", "Kill: Slimes"),
            ("Solar Essence", "medium", "Kill: Ghosts"),
            ("Void Essence", "medium", "Kill: Shadow creatures"),
            ("Refined Quartz", "easy", "Furnace: Quartz + Coal"),
        ],
    },
}


def srgb_to_linear(c: float) -> float:
    s = c / 255.0
    return s / 12.92 if s <= 0.04045 else ((s + 0.055) / 1.055) ** 2.4


def rgb_to_lab(r: int, g: int, b: int) -> tuple:
    lr = srgb_to_linear(r)
    lg = srgb_to_linear(g)
    lb = srgb_to_linear(b)

    x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375
    y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750
    z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041

    x /= 0.95047
    z /= 1.08883

    eps = 0.008856
    kap = 903.3

    fx = x ** (1 / 3) if x > eps else (kap * x + 16) / 116
    fy = y ** (1 / 3) if y > eps else (kap * y + 16) / 116
    fz = z ** (1 / 3) if z > eps else (kap * z + 16) / 116

    L = 116 * fy - 16
    a = 500 * (fx - fy)
    b_val = 200 * (fy - fz)
    return (L, a, b_val)


def delta_e(lab1, lab2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(lab1, lab2)))


def get_dominant_color(img_path: str) -> tuple | None:
    """Extract the dominant color from an icon, ignoring transparent and near-black pixels."""
    try:
        img = Image.open(img_path).convert("RGBA")
    except Exception:
        return None

    pixels = list(img.getdata())
    filtered = []
    for r, g, b, a in pixels:
        if a < 128:
            continue
        if r < 25 and g < 25 and b < 25:
            continue
        qr = (r // 8) * 8
        qg = (g // 8) * 8
        qb = (b // 8) * 8
        filtered.append((qr, qg, qb))

    if len(filtered) < 5:
        return None

    counter = Counter(filtered)
    top_colors = counter.most_common(5)

    best_color = None
    best_score = -1
    for (qr, qg, qb), count in top_colors:
        avg = (qr + qg + qb) / 3
        saturation = max(abs(qr - avg), abs(qg - avg), abs(qb - avg))
        score = count * (1 + saturation / 128)
        if score > best_score:
            best_score = score
            best_color = (qr, qg, qb)

    if best_color is None:
        best_color = top_colors[0][0]

    # Refine with average of nearby pixels
    qr, qg, qb = best_color
    bucket_pixels = [
        (r, g, b) for r, g, b, a in pixels
        if a >= 128 and not (r < 25 and g < 25 and b < 25)
        and abs((r // 8) * 8 - qr) <= 8
        and abs((g // 8) * 8 - qg) <= 8
        and abs((b // 8) * 8 - qb) <= 8
    ]

    if bucket_pixels:
        avg_r = round(sum(p[0] for p in bucket_pixels) / len(bucket_pixels))
        avg_g = round(sum(p[1] for p in bucket_pixels) / len(bucket_pixels))
        avg_b = round(sum(p[2] for p in bucket_pixels) / len(bucket_pixels))
        return (avg_r, avg_g, avg_b)

    return best_color


def icon_filename(name: str) -> str:
    """Convert item name to expected icon filename."""
    return name.replace(" ", "_") + ".png"


def main():
    print(f"Icons directory: {ICONS_DIR}")
    print(f"Output: {OUTPUT_FILE}")

    palette_entries = []
    missing_icons = []
    extracted = 0

    for category, data in PLACEABLE_ITEMS.items():
        items_list = data["items"]
        default_difficulty = data.get("difficulty")  # flooring has a shared difficulty

        for item_tuple in items_list:
            if len(item_tuple) == 2:
                name, source = item_tuple
                difficulty = default_difficulty or "easy"
            else:
                name, difficulty, source = item_tuple

            fname = icon_filename(name)
            icon_path = ICONS_DIR / fname

            # Try alternate filenames
            if not icon_path.exists():
                # Try with quotes (some icons have this)
                alt = ICONS_DIR / f"'{fname.replace('.png', '')}'.png"
                if alt.exists():
                    icon_path = alt

            if not icon_path.exists():
                missing_icons.append(name)
                continue

            color = get_dominant_color(str(icon_path))
            if color is None:
                missing_icons.append(f"{name} (no color)")
                continue

            r, g, b = color
            lab = rgb_to_lab(r, g, b)
            hex_color = f"#{r:02x}{g:02x}{b:02x}"

            # Map "resource" to "misc" for the TypeScript types
            ts_category = "misc" if category == "resource" else category

            entry = {
                "name": name,
                "id": name.lower().replace(" ", "-").replace("'", ""),
                "color": {"r": r, "g": g, "b": b},
                "lab": {"l": round(lab[0], 2), "a": round(lab[1], 2), "b": round(lab[2], 2)},
                "hex": hex_color,
                "category": ts_category,
                "difficulty": difficulty,
                "source": source,
                "seasonal": category == "crop",
                "iconFile": fname,
            }
            palette_entries.append(entry)
            extracted += 1

    print(f"\nExtracted colors from {extracted} placeable items")

    if missing_icons:
        print(f"\nMissing icons ({len(missing_icons)}):")
        for name in missing_icons:
            print(f"  - {name}")

    # Deduplicate very similar colors
    deduped = []
    for entry in palette_entries:
        lab1 = (entry["lab"]["l"], entry["lab"]["a"], entry["lab"]["b"])
        too_close = False
        for existing in deduped:
            lab2 = (existing["lab"]["l"], existing["lab"]["a"], existing["lab"]["b"])
            if delta_e(lab1, lab2) < 2.5:
                too_close = True
                break
        if not too_close:
            deduped.append(entry)

    print(f"After deduplication (ΔE < 2.5): {len(deduped)} unique palette entries")

    # Sort
    cat_order = {"flooring": 0, "crop": 1, "mineral": 2, "crafting": 3, "artisan": 4, "furniture": 5, "misc": 6}
    deduped.sort(key=lambda e: (cat_order.get(e["category"], 9), e["name"]))

    # Print breakdown
    cats = Counter(e["category"] for e in deduped)
    print("\nCategory breakdown:")
    for cat, count in sorted(cats.items(), key=lambda x: cat_order.get(x[0], 9)):
        print(f"  {cat}: {count}")

    # Color range analysis
    labs = [(e["lab"]["l"], e["lab"]["a"], e["lab"]["b"]) for e in deduped]
    print(f"\nL range: {min(l[0] for l in labs):.1f} - {max(l[0] for l in labs):.1f}")
    print(f"a range: {min(l[1] for l in labs):.1f} - {max(l[1] for l in labs):.1f}")
    print(f"b range: {min(l[2] for l in labs):.1f} - {max(l[2] for l in labs):.1f}")

    output = {"version": 1, "itemCount": len(deduped), "palette": deduped}
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(output, indent=2))
    print(f"\nWrote palette to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
