from utils.get_query_results import get_query_results


def valid_user_hash(conn, user_hash):
    query = f"select user_hash from aphrodite.users where user_hash = '{user_hash}'"

    results = get_query_results(conn, query)

    if len(results) == 1:
        return True

    else:
        return False
