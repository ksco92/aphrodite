import random
import string


def generate_user_hash(length=256):
    if not isinstance(length, int):
        raise ValueError('Length mut be of type int.')

    unique_characters = string.ascii_uppercase + string.digits + '!@#$^&*()_+{}":?><~`|' + string.ascii_lowercase
    return ''.join(random.SystemRandom().choice(unique_characters) for _ in range(length))
