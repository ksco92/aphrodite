def get_query_results(conn, query):
    results = conn.execute(query)

    if results.returns_rows:
        columns = [i[0] for i in results.cursor.description]

        final_results = []

        for row in results:
            dict_row = {}
            for val, col in zip(row, columns):
                dict_row[col] = val
            final_results.append(dict_row)

        return final_results

    return None
