import asyncio
import os
import sys
from datetime import datetime, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import get_password_hash

INITIAL_MANDALS = [
    {
        "id": "lalbaugcha-raja",
        "slug": "lalbaugcha-raja",
        "name": "Lalbaugcha Raja",
        "marathi_name": "लालबागचा राजा",
        "description": "The most famous and revered Sarvajanik Ganpati in Mumbai, founded in 1934 at Lalbaug Market. Known as Navasacha Ganpati (the one who fulfills all wishes).",
        "area": "Lalbaug",
        "zone": "Central Mumbai",
        "address": "Lalbaug Market, GD Ambekar Marg, Lalbaug, Parel, Mumbai 400012",
        "nearestStation": "Chinchpokli (Central) / Currey Road",
        "latitude": 18.9912,
        "longitude": 72.8361,
        "coordinates": {"lat": 18.9912, "lng": 72.8361},
        "image": "https://images.unsplash.com/photo-1567591414240-e22d9c15bcf0?auto=format&fit=crop&w=1200&q=80",
        "why_visit": "Known as Navasacha Ganpati, the wish-fulfilling deity attracting over 1.5 million devotees daily.",
        "history": "Founded in 1934 by local fishermen and traders of Peru Chawl after their prayer for a permanent marketplace was answered.",
        "visiting_information": "Two queues: Navas Line (touching feet, 8-15 hr wait) and Mukh Darshan (general view, 2-4 hr wait). 24-hour darshan available.",
        "how_to_reach": "5-minute walk from Chinchpokli or Currey Road railway stations. Special festival shuttle buses from Dadar.",
        "crowdWaitEstimate": "2.5 - 4 hours (Mukh Darshan)",
        "avg_darshan_time_mins": 90,
        "is_featured": True,
        "featured_order": 1,
        "is_active": True,
        "established_year": 1934,
        "category": "Iconic",
        "tags": ["Lalbaug", "Navas", "Iconic", "Central Mumbai", "24 Hours"]
    },
    {
        "id": "gsb-seva-mandal",
        "slug": "gsb-seva-mandal",
        "name": "GSB Seva Mandal Kings Circle",
        "marathi_name": "जीएसबी सेवा मंडळ",
        "description": "Affectionately known as Mumbai's Gold Ganpati. Adorned with over 66 kg of pure gold and 300+ kg of silver, with an eco-friendly clay idol.",
        "area": "Matunga / King's Circle",
        "zone": "Central Mumbai",
        "address": "Guru Ganesh Prerana, Bhookailash Nagar, Sion East, Mumbai 400022",
        "nearestStation": "King's Circle (Harbour) / Matunga (Central)",
        "latitude": 19.0330,
        "longitude": 72.8570,
        "coordinates": {"lat": 19.0330, "lng": 72.8570},
        "image": "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80",
        "why_visit": "Witness the dazzling 66kg gold-adorned idol and experience traditional South Indian Vedic rituals and free Mahaprasad.",
        "history": "Established in 1954 by the Gowd Saraswat Brahmin community to preserve Vedic rituals and charitable sevas.",
        "visiting_information": "Open for 5 days only. Free general darshan queue is fast-moving. Mahaprasad served between 12:30 PM and 3:00 PM.",
        "how_to_reach": "3 minutes walk from King's Circle railway station or 8 minutes from Matunga Station.",
        "crowdWaitEstimate": "45 - 60 mins",
        "avg_darshan_time_mins": 45,
        "is_featured": True,
        "featured_order": 2,
        "is_active": True,
        "established_year": 1954,
        "category": "Grand",
        "tags": ["GSB", "Gold Ganpati", "Eco-Friendly", "Matunga", "Mahaprasad"]
    },
    {
        "id": "chinchpokli-chintamani",
        "slug": "chinchpokli-chintamani",
        "name": "Chinchpokli Cha Chintamani",
        "marathi_name": "चिंचपोकळीचा चिंतामणी",
        "description": "One of South Mumbai's oldest mandals (107th year in 2026), celebrated for its magnificent throne design, poetic Agman Sohala, and artistic murti.",
        "area": "Chinchpokli",
        "zone": "Central Mumbai",
        "address": "Dattaram Lad Marg, Chinchpokli, Mumbai 400012",
        "nearestStation": "Chinchpokli (Central Railway)",
        "latitude": 18.9880,
        "longitude": 72.8340,
        "coordinates": {"lat": 18.9880, "lng": 72.8340},
        "image": "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80",
        "why_visit": "Famous for the spectacular Agman Sohala procession with dhol-tasha pathaks.",
        "history": "Established in 1920 by mill workers and locals to provide solace to the working class.",
        "visiting_information": "Darshan is open 6:00 AM to 1:00 AM. Peak hours between 7 PM and 11 PM.",
        "how_to_reach": "2 minutes walk from Chinchpokli Station East exit.",
        "crowdWaitEstimate": "1 - 2 hours",
        "avg_darshan_time_mins": 50,
        "is_featured": True,
        "featured_order": 3,
        "is_active": True,
        "established_year": 1920,
        "category": "Heritage",
        "tags": ["Chintamani", "Agman", "Chinchpokli", "Heritage", "100+ Years"]
    },
    {
        "id": "mumbaicha-raja-ganeshgalli",
        "slug": "mumbaicha-raja-ganeshgalli",
        "name": "Mumbaicha Raja (Ganesh Galli)",
        "marathi_name": "मुंबईचा राजा (गणेश गल्ली)",
        "description": "Renowned for pioneering breathtaking life-sized replicas of historic Indian temples including Kedarnath, Hampi, and Somnath.",
        "area": "Lalbaug",
        "zone": "Central Mumbai",
        "address": "Ganesh Galli, Lalbaug, Mumbai 400012",
        "nearestStation": "Currey Road / Chinchpokli",
        "latitude": 18.9925,
        "longitude": 72.8375,
        "coordinates": {"lat": 18.9925, "lng": 72.8375},
        "image": "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=1200&q=80",
        "why_visit": "Experience monumental thematic pandal architecture replicating India's most sacred temples.",
        "history": "Founded in 1928, it is the oldest Sarvajanik mandal in Lalbaug.",
        "visiting_information": "Best visited alongside Lalbaugcha Raja. Beautiful lighting displays in the evening.",
        "how_to_reach": "300 meters from Lalbaug Market. 5 mins walk from Currey Road station.",
        "crowdWaitEstimate": "1.5 - 2.5 hours",
        "avg_darshan_time_mins": 60,
        "is_featured": True,
        "featured_order": 4,
        "is_active": True,
        "established_year": 1928,
        "category": "Grand",
        "tags": ["Ganesh Galli", "Theme Pandals", "Lalbaug", "Grand"]
    },
    {
        "id": "khetwadi-12th-lane",
        "slug": "khetwadi-12th-lane",
        "name": "Khetwadi 12th Lane (Khetwadicha Raja)",
        "marathi_name": "खेतवाडी १२वी गल्ली (खेतवाडीचा राजा)",
        "description": "Home to Mumbai's tallest artistic Ganesha idols (reaching up to 40+ feet in previous editions) with intricate multi-headed representations.",
        "area": "Girgaon / Grant Road",
        "zone": "South Mumbai",
        "address": "12th Lane Khetwadi, Grant Road East, Mumbai 400004",
        "nearestStation": "Grant Road (Western) / Charni Road",
        "latitude": 18.9580,
        "longitude": 72.8190,
        "coordinates": {"lat": 18.9580, "lng": 72.8190},
        "image": "https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=1200&q=80",
        "why_visit": "Witness the sheer height, grandeur, and scale of Mumbai's most awe-inspiring Ganesha idols.",
        "history": "Formed in 1959, famous worldwide for creating record-breaking tall idols.",
        "visiting_information": "Explore all lanes from 1st to 14th Khetwadi in one walking circuit.",
        "how_to_reach": "7 minutes walk from Grant Road East railway station.",
        "crowdWaitEstimate": "1 - 1.5 hours",
        "avg_darshan_time_mins": 40,
        "is_featured": True,
        "featured_order": 5,
        "is_active": True,
        "established_year": 1959,
        "category": "Iconic",
        "tags": ["Khetwadi", "Tall Idol", "South Mumbai", "Grant Road"]
    },
    {
        "id": "andhericha-raja",
        "slug": "andhericha-raja",
        "name": "Andhericha Raja (Azad Nagar)",
        "marathi_name": "अंधेरीचा राजा",
        "description": "The wish-fulfilling deity of the Western Suburbs, modeled in the royal tradition with magnificent palace-themed sets.",
        "area": "Andheri West",
        "zone": "Western Suburbs",
        "address": "Azad Nagar II, Veera Desai Road, Andheri West, Mumbai 400053",
        "nearestStation": "Andheri (Western/Metro Line 1 - Azad Nagar Station)",
        "latitude": 19.1290,
        "longitude": 72.8360,
        "coordinates": {"lat": 19.1290, "lng": 72.8360},
        "image": "https://images.unsplash.com/photo-1567591414240-e22d9c15bcf0?auto=format&fit=crop&w=1200&q=80",
        "why_visit": "The pinnacle Ganpati of Western Mumbai, celebrated for extending immersion until Sankashti Chaturthi.",
        "history": "Established in 1966 by the tobacco company workers of Azad Nagar.",
        "visiting_information": "Strict traditional dress code observed. Metro 1 provides direct station access.",
        "how_to_reach": "2 minutes walk from Azad Nagar Metro Station.",
        "crowdWaitEstimate": "1 - 2 hours",
        "avg_darshan_time_mins": 45,
        "is_featured": True,
        "featured_order": 6,
        "is_active": True,
        "established_year": 1966,
        "category": "Famous",
        "tags": ["Andheri", "Western Suburbs", "Metro", "Royal Theme"]
    },
    {
        "id": "fort-vibhag-ganeshotsav",
        "slug": "fort-vibhag-ganeshotsav",
        "name": "Fort Vibhag (Fortcha Raja)",
        "marathi_name": "फोर्ट विभाग सार्वजनिक गणेशोत्सव",
        "description": "Known for royal heritage palace decor, grand chandeliers, and immaculate South Mumbai heritage ambiance.",
        "area": "Fort / CSMT",
        "zone": "South Mumbai",
        "address": "Near CST Station, Mint Road, Fort, Mumbai 400001",
        "nearestStation": "CSMT / Churchgate",
        "latitude": 18.9380,
        "longitude": 72.8350,
        "coordinates": {"lat": 18.9380, "lng": 72.8350},
        "image": "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80",
        "why_visit": "Located within Mumbai's historic heritage precinct with ornate palace architecture.",
        "history": "Established in 1955 by Fort area residents and banking staff.",
        "visiting_information": "Easy walking access from CSMT terminus.",
        "how_to_reach": "5 minutes walk from CSMT main hall.",
        "crowdWaitEstimate": "30 - 45 mins",
        "avg_darshan_time_mins": 30,
        "is_featured": True,
        "featured_order": 7,
        "is_active": True,
        "established_year": 1955,
        "category": "Heritage",
        "tags": ["Fort", "CSMT", "South Mumbai", "Heritage"]
    },
    {
        "id": "girgaoncha-raja",
        "slug": "girgaoncha-raja",
        "name": "Girgaoncha Raja (Nikadwari Lane)",
        "marathi_name": "गिरगावचा राजा",
        "description": "Famous for its majestic 25-foot traditional Shadu clay (eco-friendly) idol, upholding century-old Maharashtrian cultural purity.",
        "area": "Girgaon",
        "zone": "South Mumbai",
        "address": "Nikadwari Lane, Girgaon, Mumbai 400004",
        "nearestStation": "Charni Road (Western Railway)",
        "latitude": 18.9540,
        "longitude": 72.8180,
        "coordinates": {"lat": 18.9540, "lng": 72.8180},
        "image": "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80",
        "why_visit": "Mumbai's largest completely eco-friendly pure Shadu clay murti.",
        "history": "Established in 1928 in the heart of historic Girgaon.",
        "visiting_information": "4 mins walk from Charni Road station.",
        "how_to_reach": "Walk from Charni Road East along Girgaon Road.",
        "crowdWaitEstimate": "45 - 60 mins",
        "avg_darshan_time_mins": 35,
        "is_featured": True,
        "featured_order": 8,
        "is_active": True,
        "established_year": 1928,
        "category": "Eco-Friendly",
        "tags": ["Girgaon", "Eco-Friendly", "Shadu Clay", "Charni Road"]
    },
    {
        "id": "sahyadri-krida-mandal",
        "slug": "sahyadri-krida-mandal",
        "name": "Sahyadri Krida Mandal Chembur",
        "marathi_name": "सह्याद्री क्रीडा मंडळ चेंबूर",
        "description": "Eastern Mumbai's foremost festival attraction, renowned for elaborate themed sets and light and sound cultural spectacles.",
        "area": "Chembur / Tilak Nagar",
        "zone": "Eastern Suburbs",
        "address": "Tilak Nagar, Chembur, Mumbai 400089",
        "nearestStation": "Tilak Nagar (Harbour) / Kurla (Central)",
        "latitude": 19.0680,
        "longitude": 72.8950,
        "coordinates": {"lat": 19.0680, "lng": 72.8950},
        "image": "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=1200&q=80",
        "why_visit": "Experience Eastern Suburbs' grandest thematic set designs and cultural presentations.",
        "history": "Established in 1977 by local sports and cultural youth.",
        "visiting_information": "Ample parking around Tilak Nagar grounds.",
        "how_to_reach": "3 minutes from Tilak Nagar railway station.",
        "crowdWaitEstimate": "45 - 75 mins",
        "avg_darshan_time_mins": 40,
        "is_featured": True,
        "featured_order": 9,
        "is_active": True,
        "established_year": 1977,
        "category": "Cultural",
        "tags": ["Chembur", "Tilak Nagar", "Eastern Suburbs", "Thematic"]
    },
    {
        "id": "keshavji-naik-chawl",
        "slug": "keshavji-naik-chawl",
        "name": "Keshavji Naik Chawl (First Sarvajanik)",
        "marathi_name": "केशवजी नाईक चाळ (पहिले सार्वजनिक गणपती)",
        "description": "The birthplace of Mumbai's Sarvajanik Ganeshotsav, founded by Lokmanya Bal Gangadhar Tilak in 1893. Preserves authentic historic 2.5-foot clay idol tradition.",
        "area": "Girgaon",
        "zone": "South Mumbai",
        "address": "Keshavji Naik Chawl, Khadilkar Road, Girgaon, Mumbai 400004",
        "nearestStation": "Charni Road (Western)",
        "latitude": 18.9560,
        "longitude": 72.8220,
        "coordinates": {"lat": 18.9560, "lng": 72.8220},
        "image": "https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=1200&q=80",
        "why_visit": "Stand at the exact historical birthplace of Mumbai's public Ganesh festival celebration.",
        "history": "Started in 1893 following Lokmanya Tilak's call to unite people during the freedom struggle.",
        "visiting_information": "Intimate chawl courtyard setting with profound historical resonance.",
        "how_to_reach": "6 minutes walk from Charni Road station.",
        "crowdWaitEstimate": "20 - 30 mins",
        "avg_darshan_time_mins": 25,
        "is_featured": True,
        "featured_order": 10,
        "is_active": True,
        "established_year": 1893,
        "category": "Heritage",
        "tags": ["First Ganpati", "1893", "Lokmanya Tilak", "Historic", "Heritage"]
    }
]

INITIAL_EVENTS = [
    {
        "id": "chintamani-agman-2026",
        "name": "Chinchpokli Cha Chintamani Agman Sohala 2026",
        "title": "Chinchpokli Cha Chintamani Agman Sohala 2026",
        "description": "The legendary ceremonial arrival procession of Chinchpokli Cha Chintamani with 10+ dhol-tasha pathaks from Parel workshop to the pandal.",
        "type": "Agman",
        "image": "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80",
        "location": "Dattaram Lad Marg, Chinchpokli, Mumbai",
        "start_at": "2026-08-30T14:00:00Z",
        "end_at": "2026-08-30T23:30:00Z",
        "is_visible": True,
        "mandal_id": "chinchpokli-chintamani",
        "organizer": "Chinchpokli Sarvajanik Utsav Mandal"
    },
    {
        "id": "lalbaugcha-raja-pratham-darshan",
        "name": "Lalbaugcha Raja Pratham Darshan & Mukhawata Sohala",
        "title": "Lalbaugcha Raja Pratham Darshan & Mukhawata Sohala",
        "description": "First official public unveiling of Lalbaugcha Raja 2026 idol and royal background court set.",
        "type": "Festival Event",
        "image": "https://images.unsplash.com/photo-1567591414240-e22d9c15bcf0?auto=format&fit=crop&w=1200&q=80",
        "location": "Lalbaug Market Pandal",
        "start_at": "2026-09-11T19:00:00Z",
        "end_at": "2026-09-11T22:00:00Z",
        "is_visible": True,
        "mandal_id": "lalbaugcha-raja",
        "organizer": "Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal"
    },
    {
        "id": "gsb-maharath-aarti",
        "name": "GSB Seva Mandal 1008 Modak Maha Aarti & Havana",
        "title": "GSB Seva Mandal 1008 Modak Maha Aarti & Havana",
        "description": "Sacred Rigvedic Havana and 1008 golden modak offering led by Vedic priests at King's Circle.",
        "type": "Aarti",
        "image": "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80",
        "location": "GSB Grounds, King's Circle, Matunga",
        "start_at": "2026-09-15T11:00:00Z",
        "end_at": "2026-09-15T13:30:00Z",
        "is_visible": True,
        "mandal_id": "gsb-seva-mandal",
        "organizer": "GSB Seva Mandal"
    },
    {
        "id": "anant-chaturdashi-girgaon-visarjan",
        "name": "Girgaon Chowpatty Grand Visarjan Miravnuk",
        "title": "Girgaon Chowpatty Grand Visarjan Miravnuk",
        "description": "The grand immersion procession reaching historic Girgaon Chowpatty beach on Anant Chaturdashi.",
        "type": "Visarjan",
        "image": "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=1200&q=80",
        "location": "Girgaon Chowpatty, Marine Drive",
        "start_at": "2026-09-24T10:00:00Z",
        "end_at": "2026-09-25T08:00:00Z",
        "is_visible": True,
        "organizer": "Brihanmumbai Sarvajanik Ganeshotsav Samiti"
    }
]

INITIAL_ANNOUNCEMENTS = [
    {
        "id": "traffic-advisory-lalbaug-parel",
        "title": "Traffic Advisory: Dr. BA Road & Lalbaug Flyover One-Way",
        "description": "Mumbai Traffic Police has notified one-way vehicular traffic along Dr. Babasaheb Ambedkar Road from Parel TT to Chinchpokli bridge during festival hours.",
        "priority": 1,
        "is_visible": True,
        "start_at": "2026-08-01T00:00:00Z",
        "end_at": "2026-09-30T23:59:59Z",
        "badge_text": "Traffic Alert",
        "cta_text": "View Live Routes",
        "cta_url": "/plan"
    },
    {
        "id": "ganpass-10-passport-open",
        "title": "GanPass 10 Digital Passport Active for 2026!",
        "description": "Earn the 2026 Mumbai Pilgrim Verification by checking in at the Top 10 Sacred Mandals. Keep GPS enabled on your smartphone.",
        "priority": 2,
        "is_visible": True,
        "start_at": "2026-08-01T00:00:00Z",
        "end_at": "2026-09-30T23:59:59Z",
        "badge_text": "Passport Live",
        "cta_text": "Open My Passport",
        "cta_url": "/ganpass"
    }
]

async def seed_database():
    print(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]

    now_iso = datetime.now(timezone.utc).isoformat()

    # 1. Admin User
    admin_email = settings.ADMIN_INITIAL_EMAIL.lower()
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        await db.users.insert_one({
            "id": "admin-super",
            "name": settings.ADMIN_INITIAL_NAME,
            "email": admin_email,
            "whatsapp": "+91 98200 99999",
            "role": "admin",
            "password_hash": get_password_hash(settings.ADMIN_INITIAL_PASSWORD),
            "created_at": now_iso,
            "updated_at": now_iso,
        })
        print(f"✓ Seeded admin user: {admin_email}")
    else:
        print(f"  Admin user {admin_email} already exists.")

    # 2. Mandals
    for m in INITIAL_MANDALS:
        m_doc = dict(m)
        m_doc["created_at"] = now_iso
        m_doc["updated_at"] = now_iso
        await db.mandals.update_one({"id": m["id"]}, {"$setOnInsert": m_doc}, upsert=True)
    print(f"✓ Seeded {len(INITIAL_MANDALS)} mandals.")

    # 3. Events
    for e in INITIAL_EVENTS:
        e_doc = dict(e)
        e_doc["created_at"] = now_iso
        e_doc["updated_at"] = now_iso
        await db.events.update_one({"id": e["id"]}, {"$setOnInsert": e_doc}, upsert=True)
    print(f"✓ Seeded {len(INITIAL_EVENTS)} events.")

    # 4. Announcements
    for a in INITIAL_ANNOUNCEMENTS:
        a_doc = dict(a)
        a_doc["created_at"] = now_iso
        a_doc["updated_at"] = now_iso
        await db.announcements.update_one({"id": a["id"]}, {"$setOnInsert": a_doc}, upsert=True)
    print(f"✓ Seeded {len(INITIAL_ANNOUNCEMENTS)} announcements.")

    # 5. Site Settings
    settings_doc = {
        "key": "main_settings",
        "festival_name": "Mumbai Sarvajanik Ganeshotsav",
        "festival_edition": "2026 - 134th Year",
        "festival_start_date": "2026-09-14",
        "festival_end_date": "2026-09-24",
        "show_events": True,
        "show_announcements": True,
        "show_featured": True,
        "show_planner": True,
        "show_explore": True,
        "checkin_enabled": True,
        "passport_enabled": True,
        "registration_enabled": True,
        "checkin_radius_meters": 150.0,
        "featured_limit": 10,
        "maintenance_mode": False,
        "contact_email": "helpdesk@ganpass.in",
        "instagram": "@ganpass_mumbai",
        "website": "https://ganpass.in",
        "emergency_helpline": "112 / 100",
        "updated_at": now_iso
    }
    await db.settings.update_one({"key": "main_settings"}, {"$setOnInsert": settings_doc}, upsert=True)
    print("✓ Seeded festival settings.")

    print("\n🎉 Database seeding completed successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
