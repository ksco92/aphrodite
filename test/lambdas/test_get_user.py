import json

import pytest

from lambdas.create_user import create_user
from lambdas.get_user import get_user


@pytest.fixture
def user_hash():
    created_user = create_user('a', 'a')
    user_hash = json.loads(created_user['body'])['user_hash']
    return user_hash


def test_get_user(user_hash):
    test_event = {'multiValueQueryStringParameters': {'user_hash': [user_hash]}}

    response = get_user(test_event, 1)

    assert isinstance(response, dict)
    assert len(json.loads(response['body'])) == 1
    assert 'user_hash' in json.loads(response['body'])['user'][0]
    assert 'created_timestamp' in json.loads(response['body'])['user'][0]
    assert response['statusCode'] == 200


def test_get_user_no_hash(user_hash):
    test_events = [
        {'multiValueQueryStringParameters': {'invalid_key_name': [user_hash]}},
        {'some_other_invalid_key': {'invalid_key_name': [user_hash]}},
    ]

    for event in test_events:
        response = get_user(event, 1)

        assert isinstance(response, dict)
        assert 'error' in json.loads(response['body'])
        assert '[BAD_REQUEST]' in json.loads(response['body'])['error']
        assert response['statusCode'] == 400


def test_get_user_invalid_hash():
    test_event = {'multiValueQueryStringParameters': {'user_hash': ['this is a totally invalid hash']}}

    response = get_user(test_event, 1)

    assert isinstance(response, dict)
    assert 'error' in json.loads(response['body'])
    assert '[NOT_FOUND]' in json.loads(response['body'])['error']
    assert response['statusCode'] == 404
