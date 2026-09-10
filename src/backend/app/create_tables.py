# create_tables.py
from sqlalchemy import inspect
from database import Base, engine
import models  # importing this registers every table class onto Base.metadata

Base.metadata.create_all(engine)
print("Tables created.")
print("Tables in database:", inspect(engine).get_table_names())
