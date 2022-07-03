from utils.get_query_results import get_query_results


def valid_operation_id(conn, operation_id):
    query = f'select operation_id from aphrodite.operations where operation_id = {operation_id}'

    results = get_query_results(conn, query)

    if len(results) == 1:
        return True

    else:
        return False
