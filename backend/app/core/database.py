import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("ganpass.db")

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

db_instance = Database()

async def connect_to_mongo():
    """
    Establishes connection to MongoDB Atlas or local instance and creates essential indexes.
    """
    logger.info(f"Connecting to MongoDB at ....")
    try:
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=50,
            minPoolSize=5
        )
        db_instance.db = db_instance.client[settings.DATABASE_NAME]

        # Verify connectivity
        await db_instance.client.admin.command('ping')
        logger.info(f"Connected successfully to MongoDB database: '{settings.DATABASE_NAME}'")

        # Create indexes
        await create_indexes(db_instance.db)

    except Exception as e:
        logger.warning(f"MongoDB connection warning/fallback: {e}")

async def close_mongo_connection():
    """
    Closes the MongoDB connection pool cleanly.
    """
    if db_instance.client:
        logger.info("Closing MongoDB connection...")
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

async def create_indexes(db: AsyncIOMotorDatabase):
    """
    Creates necessary MongoDB collection indexes for optimal performance.
    """
    try:
        # Users Collection
        await db.users.create_index("email", unique=True)
        await db.users.create_index("role")

        # Mandals Collection
        await db.mandals.create_index("id", unique=True)
        await db.mandals.create_index("slug")
        await db.mandals.create_index("is_active")
        await db.mandals.create_index("is_featured")
        await db.mandals.create_index("featured_order")
        await db.mandals.create_index("area")
        await db.mandals.create_index([("latitude", 1), ("longitude", 1)])

        # Events Collection
        await db.events.create_index("id", unique=True)
        await db.events.create_index("mandal_id")
        await db.events.create_index("is_visible")
        await db.events.create_index("start_at")
        await db.events.create_index("end_at")

        # Announcements Collection
        await db.announcements.create_index("id", unique=True)
        await db.announcements.create_index("priority")
        await db.announcements.create_index("is_visible")
        await db.announcements.create_index("start_at")
        await db.announcements.create_index("end_at")

        # Checkins Collection
        await db.checkins.create_index([("user_id", 1), ("mandal_id", 1)])
        await db.checkins.create_index("created_at")

        # Stamps Collection
        await db.stamps.create_index([("user_id", 1), ("mandal_id", 1)], unique=True)

        # Settings Collection
        await db.settings.create_index("key", unique=True)

        logger.info("MongoDB indexes verified.")
    except Exception as e:
        logger.warning(f"Index creation notice: {e}")

def get_database() -> AsyncIOMotorDatabase:
    """
    Returns active MongoDB database handle.
    """
    return db_instance.db
