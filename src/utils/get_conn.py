from sqlalchemy import create_engine
from sqlalchemy.engine import Connection

from utils.am_i_lambda import am_i_lambda
from utils.get_secret import get_secret


def get_conn(secret_name: str) -> Connection:
    if am_i_lambda():
        secret = get_secret(secret_name)
        username = secret['username'],
        password = secret['password'],
        host = secret['host'],
        dbname = secret['dbname'],
        port = int(secret['port'])

    else:
        username = 'postgres'
        password = 'postgres'
        host = 'localhost'
        dbname = 'aphrodite_local'
        port = 5432

    db_url = f'postgresql+pg8000://{username}:{password}@{host}:{port}/{dbname}'
    engine = create_engine(db_url)
    conn = engine.connect()

    return conn
