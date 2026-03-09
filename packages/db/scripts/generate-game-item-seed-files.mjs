import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const seedDataDir = join(__dirname, '..', 'seed-data')
const splitItemsDir = join(seedDataDir, 'items')
const sourceItemsPath = existsSync(join(seedDataDir, 'items.json'))
  ? join(seedDataDir, 'items.json')
  : join(seedDataDir, 'game-items.json')

const existingItems = JSON.parse(readFileSync(sourceItemsPath, 'utf8'))

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function item(data) {
  const { slug, ...rest } = data
  return {
    slug: slug ?? slugify(rest.name),
    ...rest,
  }
}

function writeJson(filename, data) {
  mkdirSync(splitItemsDir, { recursive: true })
  writeFileSync(join(splitItemsDir, filename), `${JSON.stringify(data, null, 2)}\n`)
}

function assertUnique(items) {
  const seenNames = new Set()
  const seenSlugs = new Set()

  for (const entry of items) {
    if (seenNames.has(entry.name)) {
      throw new Error(`Duplicate item name: ${entry.name}`)
    }
    if (seenSlugs.has(entry.slug)) {
      throw new Error(`Duplicate item slug: ${entry.slug}`)
    }
    seenNames.add(entry.name)
    seenSlugs.add(entry.slug)
  }
}

const existingCategoryFiles = {
  Fish: 'fish.json',
  Mineral: 'minerals.json',
  Forage: 'forage.json',
  Crop: 'crops.json',
  'Animal Product': 'animal-products.json',
  'Artisan Good': 'artisan-goods.json',
  'Cooked Food': 'cooked-food.json',
  Resource: 'resources.json',
}

const allCategoryFiles = {
  ...existingCategoryFiles,
  Weapon: 'weapons.json',
  Footwear: 'boots.json',
  Ring: 'rings.json',
  Tool: 'tools.json',
  Artifact: 'artifacts.json',
  Trinket: 'trinkets.json',
  Hat: 'hats.json',
}

const isExpandedSource = existingItems.some((entry) => allCategoryFiles[entry.category] && !existingCategoryFiles[entry.category])

const weapons = [
  ...[
    ['Rusty Sword', 'Sword', 50, 'A rusty, dull old sword. Level 1 sword. Damage 2-5. Crit chance 0.02.', 'The Mines entrance'],
    ['Steel Smallsword', 'Sword', 50, 'A standard metal blade. Level 1 sword. Damage 4-8. Crit chance 0.02. Speed +2.', 'The Mines floor 20 chest reward or Adventurer\'s Guild'],
    ['Wooden Blade', 'Sword', 50, 'Not bad for a piece of carved wood. Level 1 sword. Damage 3-7. Crit chance 0.02.', 'The Mines floor 10 chest reward with remixed rewards or Adventurer\'s Guild'],
    ['Pirate\'s Sword', 'Sword', 100, 'It looks like a pirate owned this once. Level 2 sword. Damage 8-14. Crit chance 0.02. Speed +2.', 'The Mines floor 50 chest reward with remixed rewards or Adventurer\'s Guild after floor 30'],
    ['Silver Saber', 'Sword', 100, 'Plated with silver to deter rust. Level 2 sword. Damage 8-15. Crit chance 0.02. Defense +1.', 'The Mines floor 50 chest reward with remixed rewards or Adventurer\'s Guild after floor 20'],
    ['Cutlass', 'Sword', 150, 'A finely crafted blade. Level 3 sword. Damage 9-17. Crit chance 0.02. Speed +2.', 'The Mines floor 60 chest reward with remixed rewards or Adventurer\'s Guild after floor 25'],
    ['Forest Sword', 'Sword', 150, 'Made powerful by forest magic. Level 3 sword. Damage 8-18. Crit chance 0.02. Speed +2, Defense +1.', 'Special drop in The Mines floors 20-60'],
    ['Iron Edge', 'Sword', 150, 'A heavy broadsword. Level 3 sword. Damage 12-25. Crit chance 0.02. Speed -2, Defense +1, Weight +3.', 'The Mines floor 60 chest reward with remixed rewards or The Mines floors 41-59'],
    ['Insect Head', 'Sword', 200, 'Not very pleasant to wield. Level 6 sword. Damage 20-30. Crit chance 0.04. Speed +2, Crit Chance +2.', 'Adventurer\'s Guild reward for killing 80 Bugs'],
    ['Bone Sword', 'Sword', 250, 'A very light piece of sharpened bone. Level 5 sword. Damage 20-30. Crit chance 0.02. Speed +4, Weight +2.', 'The Mines floor 90 chest reward with remixed rewards, Adventurer\'s Guild after floor 75, or Skeleton drops'],
    ['Claymore', 'Sword', 250, 'It\'s really heavy. Level 5 sword. Damage 20-32. Crit chance 0.02. Speed -4, Defense +2, Weight +3.', 'The Mines floor 80 chest reward with remixed rewards or Adventurer\'s Guild after floor 45'],
    ['Neptune\'s Glaive', 'Sword', 250, 'An heirloom from beyond the Gem Sea. Level 5 sword. Damage 18-35. Crit chance 0.02. Speed -1, Defense +2, Weight +4.', 'Fishing treasure chests at Fishing Level 2+'],
    ['Templar\'s Blade', 'Sword', 250, 'It once belonged to an honorable knight. Level 5 sword. Damage 22-29. Crit chance 0. Defense +1.', 'The Mines floor 80 chest reward with remixed rewards or Adventurer\'s Guild after floor 55'],
    ['Obsidian Edge', 'Sword', 300, 'It\'s incredibly sharp. Level 6 sword. Damage 30-45. Crit chance 0.02. Speed -1, Crit Power +10.', 'The Mines floor 90 chest reward'],
    ['Ossified Blade', 'Sword', 300, 'A large, sharp blade formed from bone. Level 6 sword. Damage 26-42. Crit chance 0.02. Speed -2, Defense +1, Weight +2.', 'The Mines floor 90 chest reward with remixed rewards or Mystery Box'],
    ['Holy Blade', 'Sword', 350, 'It feels hopeful to wield. Level 7 sword. Damage 20-27. Crit chance 0.02. Speed +4, Defense +2, Crusader enchant.', 'The Mines after level 80'],
    ['Tempered Broadsword', 'Sword', 350, 'It looks like it could withstand anything. Level 7 sword. Damage 29-44. Crit chance 0.02. Speed -3, Defense +3, Weight +3.', 'The Mines floor 90 chest reward with remixed rewards or Skull Cavern'],
    ['Yeti Tooth', 'Sword', 350, 'It\'s icy cold to the touch. Level 7 sword. Damage 26-42. Crit chance 0.02. Defense +4, Crit Power +10.', 'Special drop in The Mines floors 81-99'],
    ['Steel Falchion', 'Sword', 400, 'Light and powerful. Level 8 sword. Damage 28-46. Crit chance 0.02. Speed +4, Crit Power +20.', 'The Mines floor 110 chest reward with remixed rewards, late Mines drops, Skull Cavern, or Adventurer\'s Guild after floor 90'],
    ['Dark Sword', 'Sword', 450, 'It\'s glowing with vampire energy. Level 9 sword. Damage 30-45. Crit chance 0.04. Speed -5, Crit Chance +2, Weight +5, Vampiric 9%.', 'Haunted Skull drop'],
    ['Lava Katana', 'Sword', 500, 'A powerful blade forged in a pool of churning lava. Level 10 sword. Damage 55-64. Crit chance 0.015. Defense +3, Crit Power +25, Weight +3.', 'Adventurer\'s Guild after reaching floor 120'],
    ['Dragontooth Cutlass', 'Sword', 650, 'The blade was forged from a magical tooth. Level 13 sword. Damage 75-90. Crit chance 0.02. Crit Power +50.', 'Volcano Dungeon chest'],
    ['Dwarf Sword', 'Sword', 650, 'It\'s ancient, but the blade never dulls. Level 13 sword. Damage 65-75. Crit chance 0.02. Speed +2, Defense +4.', 'Volcano Dungeon chest'],
    ['Galaxy Sword', 'Sword', 650, 'It\'s unlike anything you\'ve ever seen. Level 13 sword. Damage 60-80. Crit chance 0.02. Speed +4.', 'The Desert by offering a Prismatic Shard at the Three Pillars'],
    ['Infinity Blade', 'Sword', 850, 'The true form of the Galaxy Sword. Level 17 sword. Damage 80-100. Crit chance 0.02. Speed +4, Defense +2.', 'Forge the Galaxy Sword with 3 Galaxy Souls and 60 Cinder Shards'],
    ['Haley\'s Iron', 'Sword', 300, 'It\'s searing hot and smells like Haley\'s hair. Level 6 sword. Damage 30-45. Crit chance 0.02. Speed -1, Crit Power +10.', 'Bought from Haley for 70 Calico Eggs during the Desert Festival'],
    ['Leah\'s Whittler', 'Sword', 300, 'Leah\'s favorite tool for shaping driftwood. Level 6 sword. Damage 30-45. Crit chance 0.02. Speed -1, Crit Power +10.', 'Bought from Leah for 70 Calico Eggs during the Desert Festival'],
    ['Meowmere', 'Sword', 200, 'An unusual weapon from a far away land... Level 4 sword. Damage 20-20. Crit chance 0.02. Speed +4, Weight +2.', 'Wizard\'s Tower basement secret'],
    ['Carving Knife', 'Dagger', 50, 'A small, light blade. Level 1 dagger. Damage 1-3. Crit chance 0.04. Crit Chance +2.', 'The Mines floors 1-19'],
    ['Iron Dirk', 'Dagger', 50, 'A common dagger. Level 1 dagger. Damage 2-4. Crit chance 0.03. Crit Chance +2.', 'The Mines floor 10 chest reward with remixed rewards or Adventurer\'s Guild after floor 15'],
    ['Wind Spire', 'Dagger', 50, 'A swift little blade. Level 1 dagger. Damage 1-5. Crit chance 0.02. Crit Chance +1, Crit Power +10, Weight +5.', 'The Mines floor 10 chest reward with remixed rewards or The Mines floors 21-39'],
    ['Elf Blade', 'Dagger', 100, 'Only the nimble hands of an elf could craft this. Level 2 dagger. Damage 3-5. Crit chance 0.04. Crit Chance +2.', 'The Mines floor 20 chest reward with remixed rewards or Adventurer\'s Guild after floor 20'],
    ['Burglar\'s Shank', 'Dagger', 200, 'A weapon of choice for the swift and silent. Level 4 dagger. Damage 7-12. Crit chance 0.04. Crit Chance +2, Crit Power +25.', 'The Mines floor 60 chest reward with remixed rewards, late Mines drops, or Skull Cavern'],
    ['Crystal Dagger', 'Dagger', 200, 'The blade is made of purified quartz. Level 4 dagger. Damage 4-10. Crit chance 0.03. Crit Chance +2, Crit Power +50, Weight +5.', 'The Mines floor 60 chest reward'],
    ['Shadow Dagger', 'Dagger', 200, 'When you hold the blade to your ear you can hear 1,000 souls shrieking. Level 4 dagger. Damage 10-20. Crit chance 0.04. Crit Chance +2.', 'The Mines floor 80 chest reward with remixed rewards or The Mines floors 61-79 and 101-119'],
    ['Broken Trident', 'Dagger', 250, 'It came from the sea, but it\'s still sharp. Level 5 dagger. Damage 15-26. Crit chance 0.02. Crit Chance +1.', 'Fishing treasure chests'],
    ['Wicked Kris', 'Dagger', 400, 'The blade is made of an iridium alloy. Level 8 dagger. Damage 24-30. Crit chance 0.06. Crit Chance +4.', 'The Mines floor 90 chest reward with remixed rewards or Skull Cavern'],
    ['Galaxy Dagger', 'Dagger', 400, 'It\'s unlike anything you\'ve seen. Level 8 dagger. Damage 30-40. Crit chance 0.02. Speed +1, Crit Chance +1, Weight +5.', 'Adventurer\'s Guild after obtaining the Galaxy Sword'],
    ['Dwarf Dagger', 'Dagger', 550, 'It\'s ancient, but the blade never dulls. Level 11 dagger. Damage 32-38. Crit chance 0.03. Speed +1, Defense +6, Crit Chance +2, Weight +5.', 'Volcano Dungeon chest'],
    ['Dragontooth Shiv', 'Dagger', 600, 'The blade was forged from a magical tooth. Level 12 dagger. Damage 40-50. Crit chance 0.05. Crit Chance +3, Crit Power +100, Weight +5.', 'Volcano Dungeon chest'],
    ['Iridium Needle', 'Dagger', 600, 'The point is unbelievably sharp, even down to the atomic level. Level 12 dagger. Damage 20-35. Crit chance 0.1. Crit Chance +6, Crit Power +200.', '14% drop from special slimes when Shrine of Challenge is active'],
    ['Infinity Dagger', 'Dagger', 800, 'The true form of the Galaxy Dagger. Level 16 dagger. Damage 50-70. Crit chance 0.06. Speed +1, Defense +3, Crit Chance +4, Weight +5.', 'Forge the Galaxy Dagger with 3 Galaxy Souls and 60 Cinder Shards'],
    ['Elliott\'s Pencil', 'Dagger', 200, 'Elliott used this to write his book. It\'s sharp! Level 8 dagger. Damage 24-30. Crit chance 0.06. Crit Chance +4.', 'Bought from Elliott for 70 Calico Eggs during the Desert Festival'],
    ['Abby\'s Planchette', 'Dagger', 200, 'It\'s made from fine marblewood. Level 8 dagger. Damage 24-30. Crit chance 0.06. Crit Chance +4.', 'Bought from Abigail for 70 Calico Eggs during the Desert Festival'],
    ['Femur', 'Club', 100, 'An old, heavy bone caked in centuries of grime. Level 2 club. Damage 6-11. Crit chance 0.02. Speed +2.', 'The Mines floor 10 chest reward with remixed rewards or Adventurer\'s Guild after floor 10'],
    ['Wood Club', 'Club', 100, 'A solid piece of wood, crudely chiseled into a club shape. Level 2 club. Damage 9-16. Crit chance 0.02.', 'The Mines floor 20 chest reward with remixed rewards or The Mines floors 1-39'],
    ['Wood Mallet', 'Club', 150, 'The solid head packs a punch. Relatively light for a club. Level 3 club. Damage 15-24. Crit chance 0.02. Speed +2, Weight +2.', 'The Mines floor 60 chest reward with remixed rewards, The Mines floors 41-79, or Adventurer\'s Guild after floor 40'],
    ['Lead Rod', 'Club', 200, 'It\'s incredibly heavy. Level 4 club. Damage 18-27. Crit chance 0.02. Speed -4.', 'The Mines floors 41-79'],
    ['Kudgel', 'Club', 250, 'A brute\'s companion. Level 5 club. Damage 27-40. Crit chance 0.02. Speed -1, Crit Power +50, Weight +2.', 'The Mines floor 80 chest reward with remixed rewards or The Mines floors 101+'],
    ['The Slammer', 'Club', 350, 'An extremely heavy gavel that\'ll send foes flying. Level 7 club. Damage 40-55. Crit chance 0.02. Speed -2.', 'The Mines floor 110 chest reward with remixed rewards, The Mines floors 81-99, or Skull Cavern'],
    ['Galaxy Hammer', 'Club', 600, 'It\'s made from an ultra-light material you\'ve never seen before. Level 12 club. Damage 70-90. Crit chance 0.02. Speed +2, Weight +5.', 'Adventurer\'s Guild after obtaining the Galaxy Sword'],
    ['Dwarf Hammer', 'Club', 650, 'It emits a very faint whirring sound. Level 13 club. Damage 75-85. Crit chance 0.02. Defense +2, Weight +5.', 'Volcano Dungeon chest'],
    ['Dragontooth Club', 'Club', 700, 'This club was crafted from a magical tooth. Level 14 club. Damage 80-100. Crit chance 0.02. Crit Power +50, Weight +3.', 'Volcano Dungeon chest'],
    ['Infinity Gavel', 'Club', 850, 'The true form of the Galaxy Hammer. Level 17 club. Damage 100-120. Crit chance 0.02. Speed +2, Defense +1, Weight +5.', 'Forge the Galaxy Hammer with 3 Galaxy Souls and 60 Cinder Shards'],
    ['Alex\'s Bat', 'Club', 350, 'The sweet spot is dented from Alex\'s famous Grand Slam. Level 7 club. Damage 40-55. Crit chance 0.02. Speed -2.', 'Bought from Alex for 70 Calico Eggs during the Desert Festival'],
    ['Harvey\'s Mallet', 'Club', 350, 'It brings back memories of Harvey\'s clinic. Level 7 club. Damage 40-55. Crit chance 0.02. Speed -2.', 'Bought from Harvey for 70 Calico Eggs during the Desert Festival'],
    ['Maru\'s Wrench', 'Club', 350, 'A big, metal wrench. It smells like Maru. Level 7 club. Damage 40-55. Crit chance 0.02. Speed -2.', 'Bought from Maru for 70 Calico Eggs during the Desert Festival'],
    ['Penny\'s Fryer', 'Club', 350, 'Penny\'s favorite frying pan. There\'s some rubbery gunk stuck to the inside. Level 7 club. Damage 40-55. Crit chance 0.02. Speed -2.', 'Bought from Penny for 70 Calico Eggs during the Desert Festival'],
    ['Sam\'s Old Guitar', 'Club', 350, 'It\'s seen better days. Level 7 club. Damage 40-55. Crit chance 0.02. Speed -2.', 'Bought from Sam for 70 Calico Eggs during the Desert Festival'],
    ['Seb\'s Lost Mace', 'Club', 350, 'One of Sebastian\'s medieval replicas. Level 7 club. Damage 40-55. Crit chance 0.02. Speed -2.', 'Bought from Sebastian for 70 Calico Eggs during the Desert Festival'],
    ['Slingshot', 'Slingshot', null, 'Requires stones or other ammo. Crit chance 0.02. Damage depends on ammo used.', 'The Mines floor 40 chest reward'],
    ['Master Slingshot', 'Slingshot', null, 'Requires stones or other ammo. Crit chance 0.02. Generally deals double regular slingshot damage with the same ammo.', 'The Mines floor 70 chest reward'],
  ].map(([name, subcategory, sellPrice, description, obtainMethod]) =>
    item({
      name,
      category: 'Weapon',
      subcategory,
      sellPrice,
      description,
      obtainMethod,
      season: 'All',
      location: 'Mines, Skull Cavern, Volcano Dungeon, Desert Festival, or special reward',
    }),
  ),
]

const boots = [
  ...[
    ['Sneakers', 50, 'A little flimsy... but fashionable! Defense +1.', 'Purchased from the Adventurer\'s Guild after Initiation, special item drops on The Mines floors 1-39, or fishing treasure chests'],
    ['Rubber Boots', 50, 'Protection from the elements. Immunity +1.', 'Special item drops on The Mines floors 1-39 or fishing treasure chests'],
    ['Leather Boots', 100, 'The leather is very supple. Defense +1, Immunity +1.', 'Floor 10 Mines chest reward, Adventurer\'s Guild after floor 10, or fishing treasure chests'],
    ['Work Boots', 100, 'Steel-toed for extra protection. Defense +2.', 'Adventurer\'s Guild after floor 10, possible remixed chest reward, or fishing treasure chests'],
    ['Combat Boots', 150, 'Reinforced with iron mesh. Defense +3.', 'Adventurer\'s Guild after floor 40, possible remixed floor 50 chest, special drops on floors 61-79, or fishing treasure chests'],
    ['Tundra Boots', 150, 'The fuzzy lining keeps your ankles so warm. Defense +2, Immunity +1.', 'Floor 50 Mines chest reward, Adventurer\'s Guild after floor 50, or fishing treasure chests'],
    ['Leprechaun Shoes', 150, 'The buckle\'s made of solid gold. Defense +2, Immunity +1.', 'Train drops'],
    ['Thermal Boots', 150, 'Designed with extreme weather in mind. Defense +1, Immunity +2.', 'Possible remixed floor 50 chest, special item drops on floors 41-79, or fishing treasure chests'],
    ['Dark Boots', 300, 'Made from thick black leather. Defense +4, Immunity +2.', 'Adventurer\'s Guild after floor 80, possible remixed floor 80 chest, late Mines or Skull Cavern drops, Quarry Mine drops, or fishing treasure chests'],
    ['Firewalker Boots', 300, 'It\'s said these can withstand the hottest magma. Defense +3, Immunity +3.', 'Floor 80 Mines chest reward, Adventurer\'s Guild after floor 80, or fishing treasure chests'],
    ['Genie Shoes', 350, 'A curious energy permeates the fabric. Defense +1, Immunity +6.', 'Special item drops on Mines floors 81-119, Skull Cavern, Quarry Mine, or fishing treasure chests'],
    ['Space Boots', 400, 'An iridium weave gives them a purple sheen. Defense +4, Immunity +4.', 'Floor 110 Mines chest reward or Adventurer\'s Guild after floor 110'],
    ['Crystal Shoes', 400, 'These sparkling shoes will keep your feet very safe. Defense +3, Immunity +5.', 'Possible remixed floor 110 chest, Skull Cavern drops, or Quarry Mine drops'],
    ['Emily\'s Magic Boots', 400, 'Made with love by Emily. 100% compostable! Defense +4, Immunity +4.', 'Emily\'s 14-heart event'],
    ['Cinderclown Shoes', 550, 'These magic shoes belonged to a famous Dwarvish jester. Defense +6, Immunity +5.', 'Volcano Dungeon shop for 100 Cinder Shards'],
    ['Mermaid Boots', 650, 'Mermaid scales give these boots a protective aura. Defense +5, Immunity +8.', 'Rare chest in the Volcano Dungeon'],
    ['Dragonscale Boots', 350, 'These shimmering boots are extremely tough. Defense +7.', 'Rare chest in the Volcano Dungeon'],
  ].map(([name, sellPrice, description, obtainMethod]) =>
    item({
      name,
      category: 'Footwear',
      subcategory: 'Boots',
      sellPrice,
      description,
      obtainMethod,
      season: 'All',
      location: 'Mines, Skull Cavern, Quarry Mine, Volcano Dungeon, or special event',
    }),
  ),
]

const rings = [
  ...[
    ['Small Glow Ring', 50, 'Emits a 5-radius circle of light. Light stacks with other glow rings.', 'Kill slimes in The Mines before floor 40 or find in fishing treasure chests'],
    ['Glow Ring', 100, 'Emits a 10-radius circle of light. Light stacks with other glow rings.', 'Night Fishing Bundle reward, late Mines slime or skeleton drops, mine containers, or fishing treasure chests'],
    ['Small Magnet Ring', 50, 'Increases magnetism by 1 tile. Stacks with magnet rings and Iridium Band.', 'Adventurer\'s Bundle reward, mine containers, or fishing treasure chests'],
    ['Magnet Ring', 100, 'Increases magnetism by 2 tiles. Stacks with magnet rings and Iridium Band.', 'Enemy drops on Mines floors 40-79 or mine containers'],
    ['Slime Charmer Ring', 350, 'Prevents damage from slimes and prevents the Slimed debuff.', 'Adventurer\'s Guild reward for eradicating 1,000 slimes'],
    ['Warrior Ring', 750, 'Has a chance to grant Warrior Energy after slaying a monster.', 'Craft at Combat Level 4 with 10 Iron Bars, 25 Coal, and 10 Frozen Tears'],
    ['Vampire Ring', 750, 'Restores 2 health after slaying a monster.', 'Adventurer\'s Guild reward for eradicating 200 bats'],
    ['Savage Ring', 750, 'Grants a 3-second Speed +2 buff after slaying a monster.', 'Adventurer\'s Guild reward for eradicating 150 Void Spirits'],
    ['Ring of Yoba', 750, 'Can grant Yoba\'s Blessing after taking damage; chance improves with low health and luck.', 'Craft at Combat Level 7 with 5 Iron Bars, 5 Gold Bars, and 1 Diamond'],
    ['Sturdy Ring', 750, 'Cuts the duration of negative status effects in half.', 'Craft at Combat Level 1 with 2 Copper Bars, 25 Bug Meat, and 25 Slime'],
    ['Burglar\'s Ring', 750, 'Monsters drop loot more often by rolling their loot table twice.', 'Adventurer\'s Guild reward for eradicating 500 Dust Sprites'],
    ['Iridium Band', 1000, 'Combines Glow Ring, Magnet Ring, and Ruby Ring effects.', 'Craft at Combat Level 9 with 5 Iridium Bars, 50 Solar Essence, and 50 Void Essence, or find in fishing treasure chests'],
    ['Amethyst Ring', 100, 'Increases knockback by 10%.', 'Adventurer\'s Guild after Initiation or fishing treasure chests'],
    ['Topaz Ring', 100, 'Increases defense by 1.', 'Adventurer\'s Guild after Initiation or fishing treasure chests'],
    ['Aquamarine Ring', 200, 'Increases critical strike chance by 10%.', 'Adventurer\'s Guild after floor 40 or fishing treasure chests'],
    ['Jade Ring', 200, 'Increases critical strike power by 10%.', 'Adventurer\'s Guild after floor 40 or fishing treasure chests'],
    ['Emerald Ring', 300, 'Increases weapon speed by 10%.', 'Adventurer\'s Guild after floor 80 or fishing treasure chests'],
    ['Ruby Ring', 300, 'Increases attack by 10%.', 'Adventurer\'s Guild after floor 80, fishing treasure chests, or Haunted Skull drops'],
    ['Wedding Ring', 200, 'Used to propose marriage to another player in multiplayer. No effect when worn.', 'Buy the recipe from the Traveling Cart for 500g and craft with 5 Iridium Bars and 1 Prismatic Shard'],
    ['Crabshell Ring', 1000, 'Increases defense by 5.', 'Adventurer\'s Guild reward for eradicating 60 Rock Crabs'],
    ['Napalm Ring', 1000, 'Slain monsters explode, damaging enemies and destroying objects without hurting the player.', 'Adventurer\'s Guild reward for eradicating 250 Serpents'],
    ['Thorns Ring', 100, 'Enemies that damage you take equal unmitigated damage in return.', 'Craft at Combat Level 7 with 50 Bone Fragments, 50 Stone, and 1 Gold Bar'],
    ['Lucky Ring', 100, 'Increases luck by 1.', 'Special drop in Skull Cavern or rarely from panning'],
    ['Hot Java Ring', 100, 'Greatly increases the chance to find coffee drinks from slain monsters.', 'Volcano Dungeon chests'],
    ['Protection Ring', 100, 'Extends post-hit invincibility time by 0.4 seconds.', 'Volcano Dungeon chests'],
    ['Soul Sapper Ring', 100, 'Restores 4 energy after slaying a monster.', 'Volcano Dungeon chests'],
    ['Phoenix Ring', 100, 'Once per day, restores you to 50% health after being knocked out in combat.', 'Volcano Dungeon chests'],
    ['Immunity Band', 250, 'Increases immunity by 4.', 'Special item in Skull Cavern and The Mines floor 100+'],
    ['Glowstone Ring', 100, 'Combines Glow Ring and Magnet Ring effects.', 'Craft at Mining Level 4 with 5 Solar Essence and 5 Iron Bars'],
  ].map(([name, sellPrice, description, obtainMethod]) =>
    item({
      name,
      category: 'Ring',
      subcategory: 'Accessory Ring',
      sellPrice,
      description,
      obtainMethod,
      season: 'All',
      location: 'Mines, Skull Cavern, Volcano Dungeon, Adventurer\'s Guild, crafting, or special reward',
    }),
  ),
]
const tools = [
  ...[
    ['Hoe', 'Hoe', null, 'Starter tool used to till soil and dig artifact spots.', 'Starter tool'],
    ['Copper Hoe', 'Hoe', null, 'Upgraded hoe. Tills up to 3 tiles in a line.', 'Upgrade at the Blacksmith for 2,000g and 5 Copper Bars'],
    ['Steel Hoe', 'Hoe', null, 'Upgraded hoe. Tills up to 5 tiles in a line.', 'Upgrade at the Blacksmith for 5,000g and 5 Iron Bars'],
    ['Gold Hoe', 'Hoe', null, 'Upgraded hoe. Tills a 3x3 area.', 'Upgrade at the Blacksmith for 10,000g and 5 Gold Bars'],
    ['Iridium Hoe', 'Hoe', null, 'Upgraded hoe. Tills a 6x3 area.', 'Upgrade at the Blacksmith for 25,000g and 5 Iridium Bars'],
    ['Pickaxe', 'Pickaxe', null, 'Starter pickaxe for rocks, nodes, and clearing tilled soil.', 'Starter tool'],
    ['Copper Pickaxe', 'Pickaxe', null, 'Upgraded pickaxe that breaks basic mine rocks faster and copper nodes in 2 hits.', 'Upgrade at the Blacksmith for 2,000g and 5 Copper Bars'],
    ['Steel Pickaxe', 'Pickaxe', null, 'Upgraded pickaxe that can break farm boulders and the Dwarf barrier.', 'Upgrade at the Blacksmith for 5,000g and 5 Iron Bars'],
    ['Gold Pickaxe', 'Pickaxe', null, 'Upgraded pickaxe that can break meteorites and stronger mine rocks faster.', 'Upgrade at the Blacksmith for 10,000g and 5 Gold Bars'],
    ['Iridium Pickaxe', 'Pickaxe', null, 'Top-tier pickaxe that breaks Quarry Mine and Skull Cavern rocks in 1 hit.', 'Upgrade at the Blacksmith for 25,000g and 5 Iridium Bars'],
    ['Axe', 'Axe', null, 'Starter axe for chopping trees and small stumps.', 'Starter tool'],
    ['Copper Axe', 'Axe', null, 'Upgraded axe that can chop large stumps.', 'Upgrade at the Blacksmith for 2,000g and 5 Copper Bars'],
    ['Steel Axe', 'Axe', null, 'Upgraded axe that can chop large logs.', 'Upgrade at the Blacksmith for 5,000g and 5 Iron Bars'],
    ['Gold Axe', 'Axe', null, 'Upgraded axe that chops full trees in 4 hits.', 'Upgrade at the Blacksmith for 10,000g and 5 Gold Bars'],
    ['Iridium Axe', 'Axe', null, 'Top-tier axe that chops full trees in 2 hits.', 'Upgrade at the Blacksmith for 25,000g and 5 Iridium Bars'],
    ['Watering Can', 'Watering Can', null, 'Starter watering can with 40 charge capacity.', 'Starter tool'],
    ['Copper Watering Can', 'Watering Can', null, 'Upgraded watering can with 55 capacity and a 3-tile line charge.', 'Upgrade at the Blacksmith for 2,000g and 5 Copper Bars'],
    ['Steel Watering Can', 'Watering Can', null, 'Upgraded watering can with 70 capacity and a 5-tile line charge.', 'Upgrade at the Blacksmith for 5,000g and 5 Iron Bars'],
    ['Gold Watering Can', 'Watering Can', null, 'Upgraded watering can with 85 capacity and a 3x3 charge.', 'Upgrade at the Blacksmith for 10,000g and 5 Gold Bars'],
    ['Iridium Watering Can', 'Watering Can', null, 'Top-tier watering can with 100 capacity and a 6x3 charge.', 'Upgrade at the Blacksmith for 25,000g and 5 Iridium Bars'],
    ['Trash Can', 'Trash Can', null, 'Starter trash can for deleting items.', 'Starter tool'],
    ['Copper Trash Can', 'Trash Can', null, 'Returns 15% of an item\'s value when trashed.', 'Upgrade at the Blacksmith for 1,000g and 5 Copper Bars'],
    ['Steel Trash Can', 'Trash Can', null, 'Returns 30% of an item\'s value when trashed.', 'Upgrade at the Blacksmith for 2,500g and 5 Iron Bars'],
    ['Gold Trash Can', 'Trash Can', null, 'Returns 45% of an item\'s value when trashed.', 'Upgrade at the Blacksmith for 5,000g and 5 Gold Bars'],
    ['Iridium Trash Can', 'Trash Can', null, 'Returns 60% of an item\'s value when trashed.', 'Upgrade at the Blacksmith for 12,500g and 5 Iridium Bars'],
    ['Training Rod', 'Fishing Pole', null, 'Simplified rod that only catches common fish.', 'Buy from Willy\'s Fish Shop for 25g'],
    ['Bamboo Pole', 'Fishing Pole', null, 'Basic fishing pole.', 'Given by Willy or bought from Willy\'s Fish Shop for 500g'],
    ['Fiberglass Rod', 'Fishing Pole', null, 'Fishing rod that can use bait.', 'Buy from Willy\'s Fish Shop for 1,800g after Fishing Level 2'],
    ['Iridium Rod', 'Fishing Pole', null, 'Fishing rod that can use bait and tackle.', 'Buy from Willy\'s Fish Shop for 7,500g after Fishing Level 6'],
    ['Advanced Iridium Rod', 'Fishing Pole', null, 'Fishing rod that can use bait and 2 tackles.', 'Claim from the Mastery Cave after Fishing Mastery'],
    ['Crab Pot', 'Fishing Tool', null, 'Passive fishing tool that catches shellfish and other water creatures when baited and placed in water.', 'Craft at Fishing Level 3 or buy from Willy\'s Fish Shop'],
    ['Copper Pan', 'Pan', null, 'Panning tool that finds 3 to 9 ores and up to 1 special item.', 'Receive the pan, then upgrade or replace with the Copper Pan for 2,500g'],
    ['Steel Pan', 'Pan', null, 'Panning tool that finds 4 to 10 ores and up to 2 special items.', 'Upgrade at the Blacksmith for 5,000g and 5 Iron Bars'],
    ['Gold Pan', 'Pan', null, 'Panning tool that finds 5 to 11 ores and up to 3 special items.', 'Upgrade at the Blacksmith for 10,000g and 5 Gold Bars'],
    ['Iridium Pan', 'Pan', null, 'Panning tool that finds 6 to 12 ores and up to 4 special items.', 'Upgrade at the Blacksmith for 25,000g and 5 Iridium Bars'],
    ['Backpack (12 slots)', 'Inventory', null, 'Starter inventory with 12 slots.', 'Starter tool'],
    ['Large Pack (24 slots)', 'Inventory', null, 'Backpack upgrade that adds a second row of inventory.', 'Buy from Pierre\'s General Store for 2,000g'],
    ['Deluxe Pack (36 slots)', 'Inventory', null, 'Backpack upgrade that adds a third row of inventory.', 'Buy from Pierre\'s General Store for 10,000g after buying the Large Pack'],
    ['Scythe', 'Scythe', null, 'Starter scythe used to cut grass into hay if you have a silo.', 'Starter tool'],
    ['Golden Scythe', 'Scythe', null, 'More powerful scythe found in the Quarry Mine.', 'Found at the end of the Quarry Mine'],
    ['Iridium Scythe', 'Scythe', null, 'Can harvest any crops and excels at gathering hay.', 'Reward for Farming Mastery'],
    ['Milk Pail', 'Animal Tool', null, 'Used to collect milk from animals.', 'Buy from Marnie\'s Ranch for 1,000g'],
    ['Shears', 'Animal Tool', null, 'Used to collect wool from sheep.', 'Buy from Marnie\'s Ranch for 1,000g'],
    ['Heater', 'Barn Tool', null, 'Keeps animals warmer and happier during winter.', 'Buy from Marnie\'s Ranch for 2,000g or earn from the Fodder Bundle'],
    ['Auto-Grabber', 'Barn Tool', null, 'Automatically harvests from animals every morning in a coop or barn.', 'Unlocked by Farming Level 10 and bought from Marnie for 25,000g'],
    ['Auto-Petter', 'Barn Tool', null, 'Keeps coop and barn animals content automatically.', 'Buy from JojaMart for 50,000g or find as a rare Skull Cavern reward'],
  ].map(([name, subcategory, sellPrice, description, obtainMethod]) =>
    item({
      name,
      category: 'Tool',
      subcategory,
      sellPrice,
      description,
      obtainMethod,
      season: 'All',
      location: 'Farm, shops, Blacksmith, mines, mastery rewards, or special locations',
    }),
  ),
]

const artifacts = [
  ...[
    ['Dwarf Scroll I', 1, 'A yellowed scroll of parchment filled with dwarven script. This one\'s tied with a red bow.', 'Tilling in the Mines or Skull Cavern on any floor, or several monster drops'],
    ['Dwarf Scroll II', 1, 'A yellowed scroll of parchment filled with dwarven script. This one\'s tied with a green ribbon.', 'Tilling in the Mines floors 1-39, or drops from Ghosts, Frost Bats, Dust Sprites, and Blue Slimes'],
    ['Dwarf Scroll III', 1, 'A yellowed scroll of parchment filled with dwarven script. This one\'s tied with a blue rope.', 'Several monster drops, especially Blue Slimes'],
    ['Dwarf Scroll IV', 1, 'A yellowed scroll of parchment filled with dwarven script. This one\'s tied with a golden chain.', 'Most monster drops or tilling in Mines floor 80+'],
    ['Chipped Amphora', 40, 'An ancient vessel made of ceramic material. Used to transport both dry and wet goods.', 'Town artifact spots or Artifact Troves'],
    ['Arrowhead', 40, 'A crudely fashioned point used for hunting.', 'Mountain, Forest, or Bus Stop artifact spots, or Artifact Troves'],
    ['Ancient Doll', 60, 'An ancient doll covered in grime. It may have been used as a toy, a decoration, or a ritual prop.', 'Mountain, Forest, Bus Stop, or Town artifact spots, fishing treasure chests, Feast of the Winter Star, or Artifact Troves'],
    ['Elvish Jewelry', 200, 'Dirty but still beautiful, with a flowing script thought to be the ancient language of the elves.', 'Forest artifact spots, fishing treasure chests, or Artifact Troves'],
    ['Chewing Stick', 50, 'Ancient people chewed on these to keep their teeth clean.', 'Mountain, Forest, or Town artifact spots, Duggy drops, fishing treasure chests, or Artifact Troves'],
    ['Ornamental Fan', 300, 'This exquisite fan most likely belonged to a noblewoman.', 'Beach, Forest, or Town artifact spots, fishing treasure chests, or Artifact Troves'],
    ['Rare Disc', 300, 'A heavy black disc studded with peculiar red stones.', 'Fishing treasure chests, certain bat or shadow monster drops, or Artifact Troves'],
    ['Ancient Sword', 100, 'It\'s the remains of an ancient sword. Most of the blade has turned to rust, but the hilt is very finely crafted.', 'Forest or Mountain artifact spots, fishing treasure chests, or Artifact Troves'],
    ['Rusty Spoon', 25, 'A plain old spoon, probably ten years old. Not very interesting.', 'Town artifact spots, tilling in the Mines or Skull Cavern, fishing treasure chests, or Artifact Troves'],
    ['Rusty Spur', 25, 'An old spur that was once attached to a cowboy\'s boot.', 'Farm artifact spots, fishing treasure chests, or Artifact Troves'],
    ['Rusty Cog', 25, 'A well preserved cog that must have been part of some ancient machine.', 'Mountain artifact spots, tilling in the Mines or Skull Cavern, fishing treasure chests, or Artifact Troves'],
    ['Chicken Statue', 50, 'It\'s a statue of a chicken on a bronze base.', 'Farm artifact spots, fishing treasure chests, or Artifact Troves'],
    ['Ancient Seed', 5, 'It\'s a dry old seed from some ancient plant. By all appearances it\'s long since dead...', 'Forest or Mountain artifact spots, bug-family monster drops, fishing treasure chests, or Artifact Troves'],
    ['Prehistoric Tool', 50, 'Some kind of gnarly old digging tool.', 'Bus Stop, Forest, or Mountain artifact spots, fishing treasure chests, or Artifact Troves'],
    ['Dried Starfish', 40, 'A starfish from the primordial ocean. It\'s an unusually pristine specimen!', 'Beach artifact spots, fishing treasure chests, or Artifact Troves'],
    ['Anchor', 100, 'It may have belonged to ancient pirates.', 'Beach artifact spots, fishing treasure chests, or Artifact Troves'],
    ['Glass Shards', 20, 'A mixture of glass shards smoothed by centuries of ocean surf.', 'Beach artifact spots, fishing treasure chests, or Artifact Troves'],
    ['Bone Flute', 100, 'It\'s a prehistoric wind instrument carved from an animal\'s bone.', 'Forest, Mountain, or Town artifact spots, fishing treasure chests, or Artifact Troves'],
    ['Prehistoric Handaxe', 50, 'One of the earliest tools employed by humans.', 'Bus Stop, Mountain, or Forest artifact spots, or Artifact Troves'],
    ['Dwarvish Helm', 100, 'One of the helmets commonly worn by dwarves.', 'Tilling in Mines floors 1-39, Geodes, Omni Geodes, or Artifact Troves'],
    ['Dwarf Gadget', 200, 'A piece of the advanced technology once known to the dwarves.', 'Tilling in Mines floors 40-79, Magma Geodes, Omni Geodes, or Artifact Troves'],
    ['Ancient Drum', 100, 'It\'s a drum made from wood and animal skin. It has a low, reverberating tone.', 'Bus Stop, Forest, or Town artifact spots, Frozen Geodes, Omni Geodes, or Artifact Troves'],
    ['Golden Mask', 500, 'A creepy golden mask probably used in an ancient magic ritual.', 'Desert artifact spots or Artifact Troves'],
    ['Golden Relic', 250, 'It\'s a golden slab with hieroglyphs and pictures emblazoned onto the front.', 'Desert artifact spots or Artifact Troves'],
    ['Strange Doll (green)', 1000, '???', 'Farm, Bus Stop, Town, Forest, Mountain, or Beach artifact spots, tilling in the Mines or Skull Cavern, fishing treasure chests, or Secret Note #17'],
    ['Strange Doll (yellow)', 1000, '???', 'Farm, Bus Stop, Town, Forest, Mountain, or Beach artifact spots, tilling in the Mines or Skull Cavern, fishing treasure chests, or Secret Note #18'],
    ['Prehistoric Scapula', 100, 'Commonly known as a shoulder blade. It\'s unclear what species it belonged to.', 'Forest or Town artifact spots, Skeleton drops, or Bone Nodes'],
    ['Prehistoric Tibia', 100, 'A thick and sturdy leg bone.', 'Railroad or Forest artifact spots, Pepper Rex drops, or Bone Nodes'],
    ['Prehistoric Skull', 100, 'This is definitely a mammalian skull.', 'Mountain artifact spots, Haunted Skull drops, or Bone Nodes'],
    ['Skeletal Hand', 100, 'It\'s a wonder all these ancient little pieces lasted so long.', 'Backwoods or Beach artifact spots, Haunted Skull drops, or Bone Nodes'],
    ['Prehistoric Rib', 100, 'Little gouge marks on the side suggest that this rib was someone\'s dinner.', 'Town or Farm artifact spots, Pepper Rex drops, or Bone Nodes'],
    ['Prehistoric Vertebra', 100, 'A segment of some prehistoric creature\'s spine.', 'Bus Stop artifact spots, Pepper Rex drops, or Bone Nodes'],
    ['Skeletal Tail', 100, 'It\'s pretty short for a tail.', 'Tilling in the Mines or Skull Cavern, fishing treasure chests, or Bone Nodes'],
    ['Nautilus Fossil', 80, 'This must\'ve washed up ages ago from an ancient coral reef.', 'Beach artifact spots, fishing treasure chests, or Bone Nodes'],
    ['Amphibian Fossil', 150, 'The relatively short hind legs suggest some kind of primordial toad.', 'Forest or Mountain artifact spots, fishing treasure chests, or Bone Nodes'],
    ['Palm Fossil', 100, 'Palm fossils are relatively common, but this is a particularly well-preserved specimen.', 'Desert, Forest, or Beach artifact spots, or Bone Nodes'],
    ['Trilobite', 50, 'A long extinct relative of the crab.', 'Beach, Forest, or Mountain artifact spots, or Bone Nodes'],
  ].map(([name, sellPrice, description, obtainMethod]) =>
    item({
      name,
      category: 'Artifact',
      subcategory: 'Museum Artifact',
      sellPrice,
      description,
      obtainMethod,
      season: 'All',
      location: 'Artifact spots, geodes, fishing treasure, monster drops, Bone Nodes, or troves',
    }),
  ),
]

const trinkets = [
  ...[
    ['Basilisk Paw', 'You are immune to debuffs.', 'Monster drops, crates and barrels, or Skull Cavern treasure rooms'],
    ['Fairy Box', 'Summons a fairy companion that heals you in combat. Rolls with a fairy level stat.', 'Monster drops, crates and barrels, or Skull Cavern treasure rooms'],
    ['Frog Egg', 'Summons a hungry frog companion. The egg can roll different colors.', 'Monster drops, crates and barrels, or Skull Cavern treasure rooms'],
    ['Golden Spur', 'Critical strikes give you a temporary speed boost.', 'Monster drops, crates and barrels, or Skull Cavern treasure rooms'],
    ['Ice Rod', 'Shoots an orb of ice that freezes enemies for a short duration.', 'Monster drops, crates and barrels, or Skull Cavern treasure rooms'],
    ['Magic Hair Gel', 'Your hair shimmers with all the colors of a prismatic shard.', 'Purchased from Alex\'s shop during the Desert Festival'],
    ['Magic Quiver', 'Shoots a magic arrow at nearby enemies. It can roll different arrow types and values.', 'Monster drops, crates and barrels, or Skull Cavern treasure rooms'],
    ['Parrot Egg', 'Summons a parrot companion that can cause enemies to drop gold coins. Rolls with a parrot level stat.', 'Monster drops, crates and barrels, or Skull Cavern treasure rooms'],
  ].map(([name, description, obtainMethod]) =>
    item({
      name,
      category: 'Trinket',
      subcategory: 'Combat Trinket',
      sellPrice: 1000,
      description,
      obtainMethod,
      season: 'All',
      location: 'Combat Mastery loot pools, Skull Cavern, Desert Festival',
    }),
  ),
]
const hats = [
  ...[
    ['Cowboy Hat', 'The leather is old and cracked, but surprisingly supple. It smells musty.', 'Complete the museum collection'],
    ['Bowler Hat', 'Made from smooth felt.', 'Earn 1,000,000g'],
    ['Top Hat', 'A gentleman\'s classic.', 'Purchase for 8,000 Qi Coins in Qi\'s Casino'],
    ['Sombrero', 'A festively decorated hat made from woven straw.', 'Earn 10,000,000g'],
    ['Straw Hat', 'Light and cool, it\'s a farmer\'s delight.', 'Win the egg hunt at the Egg Festival'],
    ['Official Cap', 'Looks like it belonged to a postman or policeman. Either way, it\'s still very soft and smells okay.', 'Catch 24 different fish'],
    ['Blue Bonnet', 'Harken back to simpler times with this prairie bonnet.', 'Donate 40 different items to the Museum'],
    ['Plum Chapeau', 'Looks alright.', 'Cook 25 different recipes'],
    ['Skeleton Mask', 'The red eyes are glowing mysteriously.', 'Monster Eradication Goal: defeat 50 Skeletons'],
    ['Goblin Mask', 'Freak out the neighborhood with this creepy mask. Rubber ear joints for effect.', 'Ship every item'],
    ['Chicken Mask', 'You\'ll be sure to get them grinning with this one.', 'Complete 40 Help Wanted requests'],
    ['Earmuffs', 'Keep your ears toasty. Lined with artisanal velvet from Castle Village.', 'Reach a 5-heart friend level with 20 people'],
    ['Delicate Bow', 'Little pink jewels glisten as you examine it.', 'Cook 10 different recipes'],
    ['Tropiclip', 'It\'s shaped like a little palm tree.', 'Upgrade your house'],
    ['Butterfly Bow', 'This one is very soft.', 'Reach a 5-heart friend level with someone'],
    ['Hunter\'s Cap', 'The wool lining should stay warm deep into the forest.', 'Upgrade your house to maximum size'],
    ['Trucker Hat', 'Mesh in the back to keep your head cool.', 'Craft 30 different items'],
    ['Sailor\'s Cap', 'It\'s fresh and starchy.', 'Win the fishing competition at the Festival of Ice'],
    ['Good Ol\' Cap', 'A floppy old topper with a creased bill. Looks like it\'s been through a lot.', 'Earn 15,000g'],
    ['Fedora', 'A city-slicker\'s standard.', 'Purchase for 500 Star Tokens at the Stardew Valley Fair'],
    ['Cool Cap', 'It looks really faded, but it used to be a vibrant blue.', 'Earn 250,000g'],
    ['Lucky Bow', 'The middle is made of solid gold.', 'Earn 50,000g'],
    ['Polka Bow', 'This one\'s sure to turn heads.', 'Complete 10 Help Wanted requests'],
    ['Gnome\'s Cap', 'This gnome had a very large head.', 'Craft every item'],
    ['Eye Patch', 'You can\'t tell if it\'s real or just from a costume shop.', 'Catch every fish'],
    ['Santa Hat', 'Celebrate the magical season.', 'Reach a 5-heart friend level with 10 people'],
    ['Tiara', 'This one has a big amethyst encircled by gold.', 'Reach a 5-heart friend level with 4 people'],
    ['Hard Hat', 'Keep your dome in one piece.', 'Monster Eradication Goal: defeat 30 Duggies'],
    ['Sou\'wester', 'The shape helps to keep sailors dry during storms.', 'Catch 10 different fish'],
    ['Daisy', 'A fresh spring daisy to put in your hair.', 'Craft 15 different items'],
    ['Watermelon Band', 'The color scheme was inspired by the beloved summer melon.', 'Catch 100 fish'],
    ['Mouse Ears', 'Made from synthetic fibers.', 'Reach a 10-heart friend level with someone'],
    ['Cat Ears', 'Whiskers included.', 'Reach a 10-heart friend level with 8 people'],
    ['Cowgal Hat', 'The band is studded with fake diamonds.', 'Ship 300 of one crop'],
    ['Cowpoke Hat', 'For dairy experts.', 'Ship 15 of each crop'],
    ['Archer\'s Cap', 'Fashionable whether you\'re an archer or not.', 'Cook every recipe'],
    ['Panda Hat', 'A lovely panda hat.', 'WeGame-exclusive content'],
    ['Blue Cowboy Hat', 'A denim cowboy hat in cool blue.', 'Skull Cavern treasure chests'],
    ['Red Cowboy Hat', 'An eye-catching cowboy hat in red suede.', 'Skull Cavern treasure chests'],
    ['Cone Hat', 'A curiosity from a distant land.', 'Purchase from the Magic Shop Boat at the Night Market'],
    ['Living Hat', 'It absorbs moisture from your scalp. No watering needed!', 'Rare drop while cutting weeds or from Wilderness Golems'],
    ['Emily\'s Magic Hat', 'Made with love by Emily. It\'s 100% organic!', 'Emily\'s 14-heart event'],
    ['Mushroom Cap', 'It smells earthy.', '1% chance when chopping down a Mushroom Tree'],
    ['Dinosaur Hat', 'A hat fashioned to look like a small dinosaur.', 'Tailoring'],
    ['Totem Mask', 'Don\'t worry, it won\'t warp your face...', 'Tailoring'],
    ['Logo Cap', 'A pink cap with a sleek profile.', 'Tailoring or random drop during various player actions'],
    ['Wearable Dwarf Helm', 'A slightly larger, human sized version of the helmets worn by dwarves.', 'Tailoring or random drop during various player actions'],
    ['Fashion Hat', 'A fashionable hat with a feather in the brim.', 'Tailoring or random drop during various player actions'],
    ['Pumpkin Mask', 'This must have been a pretty big pumpkin once...', 'Tailoring'],
    ['Hair Bone', 'A prehistoric version of the hair bow.', 'Tailoring or random drop during various player actions'],
    ['Knight\'s Helmet', 'It looks just like the real thing!', 'Monster Eradication Goal: defeat 50 Pepper Rex'],
    ['Squire\'s Helmet', 'The face is exposed to increase air flow.', 'Monster drop from Metal Heads'],
    ['Spotted Headscarf', 'A red polka-dot scarf tied around the head.', 'Tailoring or random drop during various player actions'],
    ['Beanie', 'A warm hat with a pretty tight fit.', 'Tailoring or random drop during various player actions'],
    ['Floppy Beanie', 'A warm hat with a looser fit.', 'Tailoring or random drop during various player actions'],
    ['Fishing Hat', 'The wide brim keeps you shaded when you\'re fishing on the riverbank.', 'Tailoring or random drop during various player actions'],
  ].map(([name, description, obtainMethod]) =>
    item({
      name,
      category: 'Hat',
      subcategory: 'Cosmetic Hat',
      sellPrice: null,
      description,
      obtainMethod,
      season: 'All',
      location: 'Hat Mouse shop, festivals, tailoring, Skull Cavern, Ginger Island, Desert Festival, or special rewards',
    }),
  ),
]

hats.push(
  ...[
    ['Blobfish Mask', 'Just as spongy as the real thing!', 'Tailoring'],
    ['Party Hat (red)', 'A goofy red hat that makes any celebration more fun.', 'Tailoring or random drop during various player actions'],
    ['Party Hat (blue)', 'A goofy blue hat that makes any celebration more fun.', 'Tailoring or random drop during various player actions'],
    ['Party Hat (green)', 'A goofy green hat that makes any celebration more fun.', 'Tailoring or random drop during various player actions'],
    ['Arcane Hat', 'The type of cowboy hat worn by a wizard.', 'Monster Eradication Goal: defeat 100 Mummies'],
    ['Chef Hat', 'The traditional hat worn by a head chef.', 'Cook every recipe'],
    ['Pirate Hat', 'A captain\'s hat with a horrible skull on the front.', 'Tailoring or random drop during various player actions'],
    ['Flat Topped Hat', 'An old style of hat once considered very fashionable.', 'Tailoring or random drop during various player actions'],
    ['Elegant Turban', 'A fine black silk turban with gold trim.', 'Earn all other achievements'],
    ['White Turban', 'A fine white silk turban with blue trim.', 'Tailoring or Skull Cavern treasure chests'],
    ['Garbage Hat', 'It\'s a garbage can lid upcycled into a hat.', 'Rare chance from checking town Garbage Cans after checking at least 20 cans'],
    ['Golden Mask (Hat)', 'A faithful recreation of the Calico Desert relic!', 'Tailoring'],
    ['Propeller Hat', 'A goofy hat with a propeller on top.', 'Tailoring or random drop during various player actions'],
    ['Bridal Veil', 'The traditional headwear for a bride.', 'Tailoring or random drop during various player actions'],
    ['Witch Hat', 'A pointy hat popular with witches.', 'Tailoring or random drop during various player actions'],
    ['Copper Pan (hat)', 'You place the copper pan on your head...', 'Place the Copper Pan in the hat slot'],
    ['Green Turban', 'A green silk turban with a gold ornament on the front.', 'Desert Trader for 50 Omni Geodes'],
    ['Magic Cowboy Hat', 'It\'s shimmering with prismatic energy.', 'Desert Trader for 333 Omni Geodes on odd days'],
    ['Magic Turban', 'It\'s shimmering with prismatic energy.', 'Desert Trader for 333 Omni Geodes on even days'],
    ['Golden Helmet', 'It\'s half of a golden coconut.', 'Open Golden Coconuts'],
    ['Deluxe Pirate Hat', 'Only the most infamous pirate could pull off this look.', 'Volcano Dungeon rare chests'],
    ['Pink Bow', 'This huge bow makes quite a statement!', 'Dwarf Shop in the Volcano Dungeon for 10,000g when available'],
    ['Frog Hat', 'A slimy friend that lives on your dome.', 'Fish in the Gourmand Frog cave on Ginger Island'],
    ['Small Cap', 'It\'s a more aerodynamic style of cap.', 'Island Trader on Mondays for 30 Taro Roots'],
    ['Bluebird Mask', 'Wear this to look just like your favorite island trader.', 'Island Trader on Wednesdays for 30 Taro Roots'],
    ['Deluxe Cowboy Hat', 'A cowboy hat with a more extreme shape.', 'Island Trader on Fridays for 30 Taro Roots'],
    ['Mr. Qi\'s Hat', 'A replica of Mr. Qi\'s iconic hat.', 'Qi\'s Walnut Room for 5 Qi Gems'],
    ['Dark Cowboy Hat', 'A cowboy hat in fashionable black.', 'Skull Cavern treasure chests'],
    ['Radioactive Goggles', 'Doesn\'t actually provide any protection from radiation.', 'Tailoring or random drop during various player actions'],
    ['Swashbuckler Hat', 'The classic swashbuckler look.', 'Tailoring or random drop during various player actions'],
    ['Qi Mask', '???', 'Tailoring'],
    ['Star Helmet', 'A red hat with stars on it.', 'Tailoring or random drop during various player actions'],
    ['Sunglasses', 'These give you a relaxed look.', 'Tailoring or random drop during various player actions'],
    ['Goggles', 'These will make you look very safe.', 'Tailoring or random drop during various player actions'],
    ['Forager\'s Hat', 'It\'s a forager\'s delight.', 'Tailoring or random drop during various player actions'],
    ['Tiger Hat', 'Makes you look like a beautiful tiger.', '0.1% drop from Tiger Slimes'],
    ['Warrior Helmet', 'An Ostrich eggshell repurposed into a helmet.', 'Tailoring'],
    ['ConcernedApe Hat', '???', 'Interact with the monkey in the Volcano Caldera after achieving 100% Perfection'],
    ['Abigail\'s Bow', 'It\'s just like Abby\'s.', 'Abigail\'s Desert Festival shop for 60 Calico Eggs'],
    ['Tricorn Hat', 'It\'s a traditional hat for naval officers.', 'Elliott\'s Desert Festival shop for 100 Calico Eggs'],
    ['Joja Cap', 'An official Joja cap. Made from 100% polyester.', 'Random result from Emily\'s outfit services at the Desert Festival'],
    ['Laurel Wreath Crown', 'A garland of leaves shaped into a lovely crown.', 'Random result from Emily\'s outfit services at the Desert Festival'],
    ['Gil\'s Hat', 'It\'s the same hat that Gil wears.', 'Reward for submitting an egg rating of 25-54 to Gil during the Desert Festival'],
    ['Blue Bow', 'This huge bow makes quite a statement!', 'Calico Egg Merchant at the Desert Festival for 50 Calico Eggs'],
    ['Dark Velvet Bow', 'A big, floppy bow made of dark velvet.', 'Calico Egg Merchant at the Desert Festival for 75 Calico Eggs'],
    ['Mummy Mask', 'A large mummy mask... frightening!', 'Calico Egg Merchant at the Desert Festival for 120 Calico Eggs'],
    ['Bucket Hat', 'A simple hat with a short brim.', 'Reward from the Trout Derby'],
    ['Squid Hat', 'It\'s your chance to wear a squid on the head.', 'Reward from SquidFest'],
    ['Sports Cap', 'The cap has a vintage team logo on it.', 'Prize Machine reward'],
    ['Red Fez', 'A unique hat made popular by the famous merchant pig.', 'Traveling Cart for 8,000g when available'],
    ['Raccoon Hat', 'A classic hat from the old frontier days.', 'Fulfill the third request from the Raccoon at the Giant Stump'],
    ['Steel Pan (hat)', 'You place the steel pan on your head...', 'Place the Steel Pan in the hat slot'],
    ['Gold Pan (hat)', 'You place the gold pan on your head...', 'Place the Gold Pan in the hat slot'],
    ['Iridium Pan (hat)', 'You place the iridium pan on your head...', 'Place the Iridium Pan in the hat slot'],
    ['Mystery Hat', 'Made from the leftovers of a Mystery Box.', 'Mystery Boxes or Golden Mystery Boxes'],
    ['Dark Ballcap', 'It fits perfectly on your head.', 'Random result from Emily\'s outfit services at the Desert Festival'],
    ['Leprechaun Hat', 'The previous owner must\'ve had a big head for a Leprechaun.', 'Drops from the pot of gold by the rainbow near the Abandoned House on Spring 17'],
    ['Junimo Hat', 'To honor our little buddies...', 'Reach the summit'],
    ['Paper Hat', 'It\'s made out of special paper that won\'t disintegrate in the rain.', 'Reach Ginger Island'],
    ['Pageboy Cap', 'For some reason, it makes you want to sell newspapers.', 'Read every book'],
    ['Jester Hat', 'Put your inner clown on display.', 'See a movie'],
    ['Blue Ribbon', 'A lovely ribbon that sits behind the head.', 'Get 1st place in the Stardew Valley Fair competition'],
    ['Governor\'s Hat', 'A replica of the Governor\'s iconic hat.', 'Delight the Governor'],
    ['White Bow', 'A bow as white as snow.', 'Help your forest neighbors grow their family'],
    ['Space Helmet', 'Warning: This helmet has not actually been tested in outer space.', 'Reach the bottom of the dangerous mines'],
    ['Infinity Crown', 'It\'s made from an exotic metal you\'ve never seen before.', 'Obtain the most powerful weapon'],
  ].map(([name, description, obtainMethod]) =>
    item({
      name,
      category: 'Hat',
      subcategory: 'Cosmetic Hat',
      sellPrice: null,
      description,
      obtainMethod,
      season: 'All',
      location: 'Hat Mouse shop, festivals, tailoring, Skull Cavern, Ginger Island, Desert Festival, or special rewards',
    }),
  ),
)

function buildExistingCategoryFiles() {
  const grouped = new Map()
  const categoryFiles = isExpandedSource ? allCategoryFiles : existingCategoryFiles

  for (const existingItem of existingItems) {
    const filename = categoryFiles[existingItem.category]
    if (!filename) {
      throw new Error(`No split file configured for existing category: ${existingItem.category}`)
    }

    const list = grouped.get(filename) ?? []
    list.push(existingItem)
    grouped.set(filename, list)
  }

  return grouped
}

function sortByName(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

function buildAllCategoryFiles() {
  const grouped = buildExistingCategoryFiles()

  if (isExpandedSource) {
    for (const [filename, items] of grouped.entries()) {
      grouped.set(filename, sortByName(items))
    }

    return grouped
  }

  grouped.set('weapons.json', sortByName(weapons))
  grouped.set('boots.json', sortByName(boots))
  grouped.set('rings.json', sortByName(rings))
  grouped.set('tools.json', sortByName(tools))
  grouped.set('artifacts.json', sortByName(artifacts))
  grouped.set('trinkets.json', sortByName(trinkets))
  grouped.set('hats.json', sortByName(hats))

  return grouped
}

function verifyCounts(grouped) {
  const expected = {
    'fish.json': 74,
    'minerals.json': 66,
    'forage.json': 30,
    'crops.json': 46,
    'animal-products.json': 13,
    'artisan-goods.json': 24,
    'cooked-food.json': 81,
    'resources.json': 25,
    'weapons.json': 62,
    'boots.json': 17,
    'rings.json': 29,
    'tools.json': 46,
    'artifacts.json': 41,
    'trinkets.json': 8,
  }

  for (const [filename, expectedCount] of Object.entries(expected)) {
    const actualCount = grouped.get(filename)?.length ?? 0
    if (actualCount !== expectedCount) {
      throw new Error(`Unexpected count for ${filename}: expected ${expectedCount}, got ${actualCount}`)
    }
  }
}

function main() {
  const grouped = buildAllCategoryFiles()
  verifyCounts(grouped)

  const allItems = []

  for (const [filename, items] of grouped.entries()) {
    writeJson(filename, items)
    allItems.push(...items)
  }

  assertUnique(allItems)

  writeFileSync(join(seedDataDir, 'game-items.json'), `${JSON.stringify(sortByName(allItems), null, 2)}\n`)
  writeFileSync(
    join(seedDataDir, 'game-items-manifest.json'),
    `${JSON.stringify(
      Object.fromEntries([...grouped.entries()].map(([filename, items]) => [filename, items.length])),
      null,
      2,
    )}\n`,
  )

  console.log(`Generated ${grouped.size} split item files with ${allItems.length} total game items.`)
}

main()
