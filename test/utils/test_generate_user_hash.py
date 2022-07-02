import pytest

from utils.generate_user_hash import generate_user_hash


def test_generate_user_hash():
    user_hash_length = 20
    user_hash = generate_user_hash(length=user_hash_length)
    assert len(user_hash) == user_hash_length


def test_generate_user_hash_invalid_length():
    with pytest.raises(ValueError):
        generate_user_hash(length='abcd')
