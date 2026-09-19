/**
 * Seeds GreenRoot international internship listings.
 *
 * Usage:
 *   node scripts/seed-internships.mjs                         # uses .env.local (dev)
 *   node scripts/seed-internships.mjs --prod                  # uses .env.production.local
 *   node scripts/seed-internships.mjs --cleanup-dummies       # remove non-canonical listings
 *   node scripts/seed-internships.mjs --sync                  # update existing listings in place
 *   node scripts/seed-internships.mjs --env-file path/to/env  # custom env file
 */

import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PLACEHOLDER_IMAGE = '/images/placeholder.png'

const INTERNSHIP_IMAGES = {
  'Denmark Dairy Farming Internship Program': '/images/internships/denmark-dairy-farming.png',
  'Denmark Poultry Farming Internship Program': '/images/internships/denmark-poultry-farming.png',
  'Denmark Horticulture Internship Program': '/images/internships/denmark-horticulture.png',
  'Germany Dairy Farming Internship Program': '/images/internships/germany-dairy-farming.png',
  'Germany Poultry Farming Internship Program': '/images/internships/germany-poultry-farming.png',
  'Germany Horticulture Internship Program': '/images/internships/germany-horticulture.png',
  'Israel Dairy Farming Volunteering Program': '/images/internships/israel-dairy-farming.png',
  'Israel Poultry Farming Volunteering Program': '/images/internships/israel-poultry-farming.png',
  'Israel Horticulture Volunteering Program': '/images/internships/israel-horticulture.png',
  'USA Field Crop Internship Program': '/images/internships/usa-field-crop.png',
  'USA Dairy & Poultry Farming Internship Program': '/images/internships/usa-dairy-poultry-farming.png',
  'USA Greenhouse Initiative Internship Program': '/images/internships/usa-greenhouse-initiative.png',
  'USA Vegetable Production Internship Program': '/images/internships/usa-vegetable-production.png',
  'USA Wine Course Internship Program': '/images/internships/usa-wine-course.png',
  'Australia Horticulture Internship Program': '/images/internships/australia-horticulture.png',
  'Australia Dairy & Poultry Farming Internship Program':
    '/images/internships/australia-dairy-poultry-farming.png',
  'Short-Duration Educational & Volunteering Programs':
    '/images/internships/short-duration-programs.jpg',
}

function parseEnvFile(filePath) {
  const raw = readFileSync(filePath, 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1)
  }
  return env
}

function loadEnv() {
  const args = process.argv.slice(2)
  const envFileArg = args.find((arg) => arg.startsWith('--env-file='))?.split('=')[1]
  const useProd = args.includes('--prod')
  const envPath = resolve(
    process.cwd(),
    envFileArg || (useProd ? '.env.production.local' : '.env.local')
  )

  if (!existsSync(envPath)) {
    throw new Error(
      `Env file not found: ${envPath}. Create it with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.`
    )
  }

  const fileEnv = parseEnvFile(envPath)
  return {
    envPath,
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || fileEnv.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY || fileEnv.SUPABASE_SERVICE_ROLE_KEY,
  }
}

const DOC_BLOCK_START = '\n\n[[REQUIRED_DOCUMENTS]]\n'
const DOC_BLOCK_END = '\n[[/REQUIRED_DOCUMENTS]]'

function withRequiredDocuments(description, documents) {
  const docs = documents.trim()
  if (!docs) return description
  return `${description}${DOC_BLOCK_START}${docs}${DOC_BLOCK_END}`
}

function toJsonArray(items) {
  return JSON.stringify(items)
}

function toSkillsJson(names) {
  return JSON.stringify(names.map((name) => ({ icon: 'Leaf', name })))
}

const REQUIRED_DOCUMENTS = [
  'Passport copy',
  'Aadhaar card',
  'PAN card',
  'Academic transcripts',
  'Resume / CV',
  'Statement of purpose',
  'Letter of recommendation',
].join('\n')

const OLD_TITLES_TO_REMOVE = [
  'Denmark Internship Program',
  'Germany Internship Program',
  'USA Internship and Training Program',
  'Israel Volunteering Program',
  'Australia Internship and Training Program',
  'Short-Duration Educational & Volunteering Programs',
]

const DAIRY_RESPONSIBILITIES = [
  'Milking operations',
  'Animal nutrition and feeding',
  'Cleaning and sanitation',
  'Maintaining farm records',
  'Forage and grain harvesting',
  'Treatment of sick animals',
  'Sanitation and waste disposal',
  'Dairy cattle care and feeding',
  'Rationalization',
  'Managing pasture',
  'Herd health administration',
  'Herd reproduction control',
]

const DAIRY_SKILLS = [
  'Modern dairy farm operations',
  'Milking systems (tie-stall, stanchion, and parlour set-ups)',
  'Herd health and nutrition management',
  'Record keeping and farm administration',
  'Breeding and nutrition programmes',
  'Pasture and forage management',
]

const POULTRY_RESPONSIBILITIES = [
  'Egg collection, packing, and delivery',
  'Poultry house cleaning and sanitation',
  'Feed and nutrition management',
  'Maintaining flock records',
  'Flock health monitoring',
  'Rationalization',
  'Waste disposal and sanitation',
]

const POULTRY_SKILLS = [
  'Poultry farm operations',
  'Egg production and handling',
  'Flock health monitoring',
  'Feed and nutrition management',
  'Record keeping and farm administration',
  'Sanitation and biosecurity practices',
]

const HORTICULTURE_RESPONSIBILITIES = [
  'Operation of farm machinery',
  'Crop maintenance',
  'Gathering and harvesting',
  'Crop rotation administration',
  'Identification and control of weeds',
  'Seed preparation',
  'Crop protection and fertilizer decisions',
  'Farm accounting',
]

const HORTICULTURE_SKILLS = [
  'Crop production and machinery operation',
  'Crop rotation and weed management',
  'Seed preparation and planting',
  'Crop protection and fertilization',
  'Harvesting and post-harvest handling',
  'Farm accounting and record keeping',
]

const USA_FIELD_CROP_RESPONSIBILITIES = HORTICULTURE_RESPONSIBILITIES

const USA_DAIRY_POULTRY_RESPONSIBILITIES = [
  ...DAIRY_RESPONSIBILITIES,
  'Egg collection, packing, and delivery',
]

const USA_GREENHOUSE_RESPONSIBILITIES = [
  'Planting of nursery stock',
  'Irrigation',
  'Weed management',
  'Fertilization',
  'Transplantation',
  'Commercial and marketing operations',
]

const USA_VEGETABLE_RESPONSIBILITIES = [
  'Gardening',
  'Fertilization',
  'Watering',
  'Insect and weed control',
  'Use of small equipment',
  'Pruning',
  'Spreading',
  'Cross-pollination',
  'Gathering and harvesting',
  'Preparation and packaging',
  'Safekeeping and dissemination',
  'Sales',
]

const USA_WINE_RESPONSIBILITIES = [
  'Sanitation of tanks',
  'Grape harvesting',
  'Crushing and de-stemming',
  'Juice storage',
  'Red pump-over',
  'Agitating barrels',
  'Equipment breakdowns and maintenance',
  'Emptying red fermenters',
  'Draining and shovelling out tanks',
  'Pushing and juice barrelling',
  'Filling barrels',
]

// Converted from INR using March 2026 indicative rates (1 INR ≈ 0.0692 DKK)
const DENMARK_STIPEND_MONTHLY = 9000

const DENMARK_TIERED_BENEFITS = [
  'kr 9,000/month (before tax) for the first 6 months',
  'kr 10,700/month (before tax) after 6 months',
  'Year-round program availability',
  'Hands-on training on modern European farms',
]

const DENMARK_ELIGIBILITY = [
  'Must be pursuing a degree in agriculture',
  'Graduate candidates are not eligible',
  'Valid passport required',
]

const GERMANY_ELIGIBILITY = [
  'Must have relevant international experience in agriculture',
  'Fresher candidates are not eligible',
  'Valid passport required',
]

// 1 INR ≈ 0.0093 EUR
const GERMANY_STIPEND_MONTHLY = 1116

const GERMANY_BENEFITS = [
  '€1,116/month (before tax)',
  'Stipend may vary from farm to farm',
  'Year-round program availability',
  'Placement matched to previous experience',
]

const ISRAEL_ELIGIBILITY = [
  'Must be interested in agriculture studies',
  'Valid passport required',
]

// 1 INR ≈ 0.0338 ILS
const ISRAEL_STIPEND_MONTHLY = 1859

const ISRAEL_BENEFITS = [
  '₪1,859/month stipend',
  'Authentic Kibbutz community experience',
  'Year-round program availability',
  'International volunteer community',
]

const USA_ELIGIBILITY = [
  'Must be pursuing a degree in agriculture',
  'Graduate candidates can apply within 12 months of passing out',
  'If graduated more than a year ago, must have relevant agricultural experience',
  'Fresher candidates are not eligible',
  'Valid passport required',
]

// 1 INR ≈ 0.0107 USD
const USA_STIPEND_MONTHLY = 1177

const USA_BENEFITS = [
  '$1,177/month (before tax)',
  'Stipend may vary from farm to farm',
  'One-on-one training with USA host farms',
  'Actual work and lessons vary by placement and previous experience',
]

const AUSTRALIA_ELIGIBILITY = [
  'Must have relevant international experience in agriculture',
  'Fresher candidates are not eligible',
  'Valid passport required',
]

// Aligned with USA stipend level (A$1,177/month)
const AUSTRALIA_STIPEND_MONTHLY = 1177

const AUSTRALIA_BENEFITS = [
  'A$1,177/month (before tax)',
  'Stipend may vary from farm to farm',
  'Optional 12-month extension after initial 12 months',
  'Placement matched to previous experience',
  'Actual work and lessons vary by placement and previous experience',
]

function withListingImages(listing) {
  const image = INTERNSHIP_IMAGES[listing.title] || PLACEHOLDER_IMAGE
  return {
    ...listing,
    image_url: image,
    secondary_image_url: image,
  }
}

function denmarkListing(category, subtitle, intro, responsibilities, skills, badge = category) {
  return withListingImages({
    title: `Denmark ${category} Internship Program`,
    badge,
    subtitle,
    city: 'Various',
    country: 'Denmark',
    flag_emoji: '🇩🇰',
    short_description: `12–18 month paid ${category.toLowerCase()} internship in Denmark. ${subtitle} Year-round availability.`,
    long_description: withRequiredDocuments(
      `${intro}

Program category: ${category}.

Duration: 12–18 months
Program availability: Year-round
Stipend: kr 9,000 per month (before tax) for the first 6 months; kr 10,700 per month (before tax) after 6 months.`,
      REQUIRED_DOCUMENTS
    ),
    duration_months: 15,
    stipend_monthly: DENMARK_STIPEND_MONTHLY,
    work_mode: 'onsite',
    key_responsibilities: toJsonArray(responsibilities),
    skills_learned: toSkillsJson(skills),
    eligibility_requirements: toJsonArray(DENMARK_ELIGIBILITY),
    stipend_benefits: toJsonArray(DENMARK_TIERED_BENEFITS),
  })
}

function germanyListing(category, subtitle, intro, responsibilities, skills, badge = category) {
  return withListingImages({
    title: `Germany ${category} Internship Program`,
    badge,
    subtitle,
    city: 'Various',
    country: 'Germany',
    flag_emoji: '🇩🇪',
    short_description: `12–18 month paid ${category.toLowerCase()} internship in Germany. ${subtitle} Year-round availability.`,
    long_description: withRequiredDocuments(
      `${intro}

Program category: ${category}.

Duration: 12–18 months
Program availability: Year-round
Actual work and lessons will vary by placement and previous experience.
Stipend: €1,116 per month (before tax). Stipend can vary from farm to farm.`,
      REQUIRED_DOCUMENTS
    ),
    duration_months: 15,
    stipend_monthly: GERMANY_STIPEND_MONTHLY,
    work_mode: 'onsite',
    key_responsibilities: toJsonArray(responsibilities),
    skills_learned: toSkillsJson(skills),
    eligibility_requirements: toJsonArray(GERMANY_ELIGIBILITY),
    stipend_benefits: toJsonArray(GERMANY_BENEFITS),
  })
}

function israelListing(category, subtitle, intro, responsibilities, skills, badge = category) {
  return withListingImages({
    title: `Israel ${category} Volunteering Program`,
    badge,
    subtitle,
    city: 'Various',
    country: 'Israel',
    flag_emoji: '🇮🇱',
    short_description: `12-month Kibbutz ${category.toLowerCase()} volunteering programme in Israel. ${subtitle} Year-round availability.`,
    long_description: withRequiredDocuments(
      `${intro}

Program category: ${category}.

Duration: 12 months
Program availability: Year-round
Actual work and lessons will vary by placement and previous experience.
Stipend: ₪1,859 per month.`,
      REQUIRED_DOCUMENTS
    ),
    duration_months: 12,
    stipend_monthly: ISRAEL_STIPEND_MONTHLY,
    work_mode: 'onsite',
    key_responsibilities: toJsonArray(responsibilities),
    skills_learned: toSkillsJson(skills),
    eligibility_requirements: toJsonArray(ISRAEL_ELIGIBILITY),
    stipend_benefits: toJsonArray(ISRAEL_BENEFITS),
  })
}

function usaListing(category, subtitle, intro, responsibilities, skills, availability, badge = category) {
  return withListingImages({
    title: `USA ${category} Internship Program`,
    badge,
    subtitle,
    city: 'Various',
    country: 'USA',
    flag_emoji: '🇺🇸',
    short_description: `12-month paid USA exchange programme — ${category}. ${subtitle} ${availability} availability.`,
    long_description: withRequiredDocuments(
      `${intro}

Program category: ${category}.

Duration: 12 months
Program availability: ${availability}
Actual work and lessons will vary by placement and previous experience.
Stipend: $1,177 per month (before tax). Stipend can vary from farm to farm.`,
      REQUIRED_DOCUMENTS
    ),
    duration_months: 12,
    stipend_monthly: USA_STIPEND_MONTHLY,
    work_mode: 'onsite',
    key_responsibilities: toJsonArray(responsibilities),
    skills_learned: toSkillsJson(skills),
    eligibility_requirements: toJsonArray(USA_ELIGIBILITY),
    stipend_benefits: toJsonArray(USA_BENEFITS),
  })
}

function australiaListing(category, subtitle, intro, responsibilities, skills, availability, badge = category) {
  return withListingImages({
    title: `Australia ${category} Internship Program`,
    badge,
    subtitle,
    city: 'Various',
    country: 'Australia',
    flag_emoji: '🇦🇺',
    short_description: `12-month ${category.toLowerCase()} internship in Australia with optional 12-month extension. ${subtitle} ${availability} availability.`,
    long_description: withRequiredDocuments(
      `${intro}

Program category: ${category}.

Duration: 12 months, with an optional additional 12-month extension (12 + 12 months)
Program availability: ${availability}
Actual work and lessons will vary by placement and previous experience.
Stipend: A$1,177 per month (before tax). Stipend can vary from farm to farm.`,
      REQUIRED_DOCUMENTS
    ),
    duration_months: 12,
    stipend_monthly: AUSTRALIA_STIPEND_MONTHLY,
    work_mode: 'onsite',
    key_responsibilities: toJsonArray(responsibilities),
    skills_learned: toSkillsJson(skills),
    eligibility_requirements: toJsonArray(AUSTRALIA_ELIGIBILITY),
    stipend_benefits: toJsonArray([
      ...AUSTRALIA_BENEFITS,
      availability === 'Seasonal'
        ? 'Seasonal placement windows'
        : 'Year-round placement availability',
    ]),
  })
}

const internships = [
  // ── Denmark (3) ──────────────────────────────────────────
  denmarkListing(
    'Dairy Farming',
    'Hands-on training on modern Danish dairy farms',
    `As an intern in the Denmark dairy program, you will get the opportunity to be involved in a modern dairy operation. The program can include milking, feeding, cleaning, and record keeping; harvesting forage and grain; treatment of sick animals; and waste disposal and sanitation. You may also have the chance to be involved with the host breeding and nutrition programme. Dairy set-ups have either a tie-stall/stanchion barn or a free stall and parlour set-up.`,
    DAIRY_RESPONSIBILITIES,
    DAIRY_SKILLS
  ),
  denmarkListing(
    'Poultry Farming',
    'Egg production and poultry farm management training',
    `As an intern in the Denmark poultry program, you will gain hands-on experience in poultry farming operations including egg collection, packing, and delivery, flock health monitoring, feed management, and farm sanitation. Work and lessons will vary by host farm placement.`,
    POULTRY_RESPONSIBILITIES,
    POULTRY_SKILLS
  ),
  denmarkListing(
    'Horticulture',
    'Crop production and farm machinery training on Danish farms',
    `As an intern in the Denmark horticulture program, you will gain practical experience in crop production, farm machinery operation, crop maintenance, harvesting, weed control, and farm accounting on modern Danish agricultural operations.`,
    HORTICULTURE_RESPONSIBILITIES,
    HORTICULTURE_SKILLS
  ),

  // ── Germany (3) ──────────────────────────────────────────
  germanyListing(
    'Dairy Farming',
    'Precision agriculture meets modern European dairy operations',
    `In the Germany dairy farming program, you will learn how precision agriculture and modern-day farming practices impact dairy operations and agribusiness. Training includes milking, herd health, nutrition, record keeping, and full dairy farm management.`,
    DAIRY_RESPONSIBILITIES,
    [...DAIRY_SKILLS, 'Precision agriculture techniques']
  ),
  germanyListing(
    'Poultry Farming',
    'Modern poultry and egg production on German farms',
    `In the Germany poultry farming program, you will learn modern poultry farming practices including egg production, flock management, feed and nutrition, and farm sanitation within Germany's precision agriculture framework.`,
    POULTRY_RESPONSIBILITIES,
    [...POULTRY_SKILLS, 'Precision agriculture techniques']
  ),
  germanyListing(
    'Horticulture',
    'Crop production and precision farming in Germany',
    `In the Germany horticulture program, you will learn how precision agriculture and modern crop production techniques impact farming operations. Training covers machinery operation, crop rotation, weed control, and farm accounting.`,
    HORTICULTURE_RESPONSIBILITIES,
    [...HORTICULTURE_SKILLS, 'Precision agriculture techniques']
  ),

  // ── Israel (3) ──────────────────────────────────────────
  israelListing(
    'Dairy Farming',
    'Kibbutz dairy training alongside international volunteers',
    `Our organization is the only one in India that provides the true Kibbutz experience. As a dairy farming volunteer, you will work on Kibbutz dairy operations — milking, feeding, herd health, record keeping, and pasture management — while building life skills and meeting friends from around the world.`,
    DAIRY_RESPONSIBILITIES,
    [...DAIRY_SKILLS, 'Kibbutz community living', 'Cross-cultural collaboration']
  ),
  israelListing(
    'Poultry Farming',
    'Kibbutz poultry and egg production volunteering',
    `Our organization is the only one in India that provides the true Kibbutz experience. As a poultry farming volunteer, you will work on Kibbutz poultry operations including egg collection, packing, flock health, and farm sanitation — while enjoying a unique community way of life.`,
    POULTRY_RESPONSIBILITIES,
    [...POULTRY_SKILLS, 'Kibbutz community living', 'Cross-cultural collaboration']
  ),
  israelListing(
    'Horticulture',
    'Kibbutz crop production and horticulture volunteering',
    `Our organization is the only one in India that provides the true Kibbutz experience. As a horticulture volunteer, you will gain hands-on crop production experience including machinery operation, crop maintenance, harvesting, and farm accounting within the Kibbutz community.`,
    HORTICULTURE_RESPONSIBILITIES,
    [...HORTICULTURE_SKILLS, 'Kibbutz community living', 'Cross-cultural collaboration']
  ),

  // ── USA (5) ──────────────────────────────────────────────
  usaListing(
    'Field Crop',
    'Farm machinery, crop rotation, and field crop management',
    `By participating in the USA Field Crop exchange program, you will strengthen your existing skills while learning new techniques through one-on-one training with USA Hosts. This program focuses on field crop production, machinery operation, and farm management.`,
    USA_FIELD_CROP_RESPONSIBILITIES,
    HORTICULTURE_SKILLS,
    'Seasonal'
  ),
  usaListing(
    'Dairy & Poultry Farming',
    'Year-round dairy and poultry training on USA host farms',
    `By participating in the USA Dairy & Poultry Farming exchange program, you will strengthen your existing skills while learning new techniques through one-on-one training with USA Hosts. This year-round programme covers milking, herd health, poultry operations, and full farm management.`,
    USA_DAIRY_POULTRY_RESPONSIBILITIES,
    [...DAIRY_SKILLS, ...POULTRY_SKILLS],
    'Year-round'
  ),
  usaListing(
    'Greenhouse Initiative',
    'Nursery stock, irrigation, and greenhouse operations',
    `By participating in the USA Greenhouse Initiative exchange program, you will strengthen your existing skills while learning greenhouse and nursery operations through one-on-one training with USA Hosts.`,
    USA_GREENHOUSE_RESPONSIBILITIES,
    [
      'Greenhouse and nursery operations',
      'Irrigation and fertilization',
      'Transplantation techniques',
      'Commercial and marketing operations',
      'Crop protection and plant care',
    ],
    'Seasonal'
  ),
  usaListing(
    'Vegetable Production',
    'Gardening, harvesting, packaging, and vegetable sales',
    `By participating in the USA Vegetable Production exchange program, you will strengthen your existing skills while learning vegetable farming from planting through packaging and sales, through one-on-one training with USA Hosts.`,
    USA_VEGETABLE_RESPONSIBILITIES,
    [
      'Vegetable gardening and cultivation',
      'Insect and weed control',
      'Pruning and cross-pollination',
      'Harvesting, packaging, and safekeeping',
      'Direct sales and distribution',
    ],
    'Seasonal'
  ),
  usaListing(
    'Wine Course',
    'Vineyard and winery operations from grape to barrel',
    `By participating in the USA Wine Course exchange program, you will strengthen your existing skills while learning winemaking operations — from grape harvesting through fermentation, barrel work, and juice storage — through one-on-one training with USA Hosts.`,
    USA_WINE_RESPONSIBILITIES,
    [
      'Grape harvesting and crushing',
      'Fermentation and juice storage',
      'Barrel agitation and pump-over',
      'Tank sanitation and maintenance',
      'Wine production and barrelling',
    ],
    'Seasonal'
  ),

  // ── Australia (2) ────────────────────────────────────────
  australiaListing(
    'Horticulture',
    'Crop production and farm machinery on Australian farms',
    `The Australia Horticulture Internship Program offers hands-on training in crop production, farm machinery operation, crop rotation, weed management, and farm accounting on Australian agricultural operations.`,
    HORTICULTURE_RESPONSIBILITIES,
    HORTICULTURE_SKILLS,
    'Seasonal'
  ),
  australiaListing(
    'Dairy & Poultry Farming',
    'Year-round dairy and poultry training in Australia',
    `The Australia Dairy & Poultry Farming Internship Program offers hands-on training in milking, herd health, poultry operations, forage harvesting, and full farm management on Australian host farms.`,
    USA_DAIRY_POULTRY_RESPONSIBILITIES,
    [...DAIRY_SKILLS, ...POULTRY_SKILLS],
    'Year-round'
  ),

  // ── Short-Duration (1) ───────────────────────────────────
  withListingImages({
    title: 'Short-Duration Educational & Volunteering Programs',
    badge: 'Short-Duration',
    subtitle: '7–30 day programmes across Europe, Latin America, and Israel',
    city: 'Various',
    country: 'Multiple Countries',
    flag_emoji: '🌍',
    short_description:
      'Short-duration educational and volunteering programmes (7–30 days) in Italy, Portugal, Costa Rica, Guatemala, Peru, Israel, and 14+ other European countries.',
    long_description: withRequiredDocuments(
      `Other Short-Duration Educational & Volunteering Programs offer focused agricultural experiences across multiple countries. These programmes are ideal for students seeking brief but intensive international field exposure.

PROGRAMME OPTIONS:

1. Volunteering in Italy and Portugal
   • Countries: Italy, Portugal
   • Duration: 14 days
   • Field: Sustainable Farming Program
   • Program availability: Seasonal
   • Work includes: Sustainable farming practices, organic cultivation methods, and hands-on field training

2. Program in Costa Rica, Guatemala, and Peru
   • Countries: Costa Rica, Guatemala, Peru
   • Duration: 14 days
   • Field: Eco-Agriculture conservation
   • Program availability: Seasonal
   • Work includes: Eco-agriculture conservation, biodiversity preservation, and sustainable land management

3. Israel Pama-Culture Program
   • Country: Israel
   • Duration: 21 days
   • Field: All about Israel's agriculture and renewable energy
   • Program availability: Seasonal
   • Work includes: Israeli agricultural practices, renewable energy in farming, and cultural immersion

4. Programs in 14 Other European and Other Countries
   • Countries: 14+ European and other countries
   • Duration: 7–30 days
   • Field: Agriculture
   • Program availability: Seasonal
   • Work includes: Hands-on agricultural field work, cultural exchange, and community volunteering

Note: Actual work, duration within the stated range, and lessons will vary by placement and programme.`,
      REQUIRED_DOCUMENTS
    ),
    work_mode: 'onsite',
    key_responsibilities: toJsonArray([
      'Sustainable farming practices (Italy & Portugal — 14 days)',
      'Eco-agriculture conservation (Costa Rica, Guatemala, Peru — 14 days)',
      'Israel agriculture and renewable energy (Pama-Culture — 21 days)',
      'Hands-on agricultural field work (14+ European countries — 7–30 days)',
      'Cultural exchange and community volunteering',
      'Organic cultivation and land management techniques',
    ]),
    skills_learned: toSkillsJson([
      'Sustainable farming techniques',
      'Eco-agriculture and conservation practices',
      'Renewable energy in agriculture',
      'Short-term international field training',
      'Cross-cultural agricultural exchange',
      'Organic and sustainable land management',
    ]),
    eligibility_requirements: toJsonArray([
      'Interest in agriculture studies or related field',
      'Valid passport required',
      'Programme-specific requirements may apply by country',
      'Duration and placement vary by selected programme',
    ]),
    stipend_benefits: toJsonArray([
      'Focused short-term international exposure (7–30 days)',
      'Multiple country options: Italy, Portugal, Costa Rica, Guatemala, Peru, Israel, and 14+ European countries',
      'Seasonal programme availability across all options',
      'Ideal for students seeking brief international agricultural experience',
      'Israel Pama-Culture: 21-day agriculture and renewable energy immersion',
      'Italy & Portugal: 14-day sustainable farming programme',
      'Latin America: 14-day eco-agriculture conservation programme',
    ]),
  }),
]

async function cleanupDummyInternships(supabase) {
  const canonicalTitles = new Set(internships.map((item) => item.title))
  const { data: allRows, error } = await supabase.from('internships').select('id, title')

  if (error) {
    throw error
  }

  const toDelete = (allRows ?? []).filter((row) => !canonicalTitles.has(row.title))

  if (toDelete.length === 0) {
    console.log('No dummy internship listings to remove.')
    return
  }

  console.log(`Removing ${toDelete.length} dummy internship listing(s):`)
  for (const row of toDelete) {
    const { error: deleteError } = await supabase.from('internships').delete().eq('id', row.id)
    if (deleteError) {
      console.error(`  ✕ Failed to delete "${row.title}": ${deleteError.message}`)
      continue
    }
    console.log(`  ✕ ${row.title}`)
  }
}

async function syncInternshipListings(supabase) {
  console.log(`Syncing ${internships.length} internship listing(s)...`)

  for (const listing of internships) {
    const { title, ...data } = listing
    const { data: updated, error } = await supabase
      .from('internships')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('title', title)
      .select('id, title, country, stipend_monthly')

    if (error) {
      throw error
    }

    if (!updated?.length) {
      console.log(`  ⚠ Not found: ${title}`)
      continue
    }

    const row = updated[0]
    console.log(`  • ${row.title} (${row.country}) — ${row.stipend_monthly}`)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const cleanupOnly = args.includes('--cleanup-dummies')
  const syncOnly = args.includes('--sync')

  const env = loadEnv()
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env file')
  }

  const action = cleanupOnly ? 'Cleaning dummy internships' : syncOnly ? 'Syncing internships' : 'Seeding internships'
  console.log(`${action} → ${supabaseUrl}`)
  console.log(`Env file: ${env.envPath}\n`)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  if (cleanupOnly) {
    await cleanupDummyInternships(supabase)
    return
  }

  if (syncOnly) {
    await syncInternshipListings(supabase)
    return
  }

  // Remove superseded broad listings
  const { data: removed, error: removeError } = await supabase
    .from('internships')
    .delete()
    .in('title', OLD_TITLES_TO_REMOVE)
    .select('id, title')

  if (removeError) {
    throw removeError
  }

  if (removed?.length) {
    console.log(`Removed ${removed.length} superseded listing(s):`)
    for (const row of removed) {
      console.log(`  ✕ ${row.title}`)
    }
  }

  const titles = internships.map((item) => item.title)
  const { data: existing, error: existingError } = await supabase
    .from('internships')
    .select('id, title')
    .in('title', titles)

  if (existingError) {
    throw existingError
  }

  const existingTitles = new Set((existing ?? []).map((row) => row.title))
  const toInsert = internships.filter((item) => !existingTitles.has(item.title))

  if (toInsert.length === 0) {
    console.log('All granular internship listings already exist. Nothing to insert.')
    return
  }

  const { data, error } = await supabase.from('internships').insert(toInsert).select('id, title, country')

  if (error) {
    throw error
  }

  console.log(`\nInserted ${data.length} internship listing(s):`)
  for (const row of data) {
    console.log(`  • ${row.title} (${row.country}) — ${row.id}`)
  }

  if (existingTitles.size > 0) {
    console.log(`Skipped ${existingTitles.size} existing listing(s).`)
  }
}

main().catch((err) => {
  console.error('Seed failed:', err.message ?? err)
  process.exit(1)
})
