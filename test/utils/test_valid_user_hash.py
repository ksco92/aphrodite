import json
import os

import pytest

from lambdas.create_user import create_user
from utils.get_conn import get_conn
from utils.valid_user_hash import valid_user_hash


@pytest.fixture
def user_hash():
    response = create_user('a', 'a')
    user_hash = json.loads(response['body'])['user_hash']
    return user_hash


def test_valid_user_hash(user_hash):
    conn = get_conn(os.environ.get('SecretName'))
    assert valid_user_hash(conn, user_hash)


def test_invalid_user_hash():
    conn = get_conn(os.environ.get('SecretName'))
    assert not valid_user_hash(conn, 'invalid user hash')
