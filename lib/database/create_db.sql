create schema if not exists aphrodite;

drop function if exists aphrodite.get_calendar;
drop table if exists aphrodite.markers;
drop table if exists aphrodite.operations;
drop table if exists aphrodite.marker_types;
drop table if exists aphrodite.users;
drop table if exists aphrodite.dates;

create table aphrodite.dates
(
    date_dim_id            int        not null,
    date_actual            date       not null,
    epoch                  bigint     not null,
    day_suffix             varchar(4) not null,
    day_name               varchar(9) not null,
    day_of_week            int        not null,
    day_of_month           int        not null,
    day_of_quarter         int        not null,
    day_of_year            int        not null,
    week_of_month          int        not null,
    week_of_year           int        not null,
    week_of_year_iso       char(10)   not null,
    month_actual           int        not null,
    month_name             varchar(9) not null,
    month_name_abbreviated char(3)    not null,
    quarter_actual         int        not null,
    quarter_name           varchar(9) not null,
    year_actual            int        not null,
    first_day_of_week      date       not null,
    last_day_of_week       date       not null,
    first_day_of_month     date       not null,
    last_day_of_month      date       not null,
    first_day_of_quarter   date       not null,
    last_day_of_quarter    date       not null,
    first_day_of_year      date       not null,
    last_day_of_year       date       not null,
    mmyyyy                 char(6)    not null,
    mmddyyyy               char(10)   not null,
    weekend_indr           boolean    not null,
    primary key (date_actual)
);

create index dates_date_actual on aphrodite.dates (date_actual);

insert into aphrodite.dates
select to_char(datum, 'yyyymmdd')::int                                                        as date_dim_id,
       datum                                                                                  as date_actual,
       extract(epoch from datum)                                                              as epoch,
       to_char(datum, 'fmDDth')                                                               as day_suffix,
       to_char(datum, 'TMDay')                                                                as day_name,
       extract(isodow from datum)                                                             as day_of_week,
       extract(day from datum)                                                                as day_of_month,
       datum - date_trunc('quarter', datum)::date + 1                                         as day_of_quarter,
       extract(doy from datum)                                                                as day_of_year,
       to_char(datum, 'W')::int                                                               as week_of_month,
       extract(week from datum)                                                               as week_of_year,
       extract(isoyear from datum) || to_char(datum, '"-W"IW-') || extract(isodow from datum) as week_of_year_iso,
       extract(month from datum)                                                              as month_actual,
       to_char(datum, 'TMMonth')                                                              as month_name,
       to_char(datum, 'Mon')                                                                  as month_name_abbreviated,
       extract(quarter from datum)                                                            as quarter_actual,
       case
           when extract(quarter from datum) = 1 then 'First'
           when extract(quarter from datum) = 2 then 'Second'
           when extract(quarter from datum) = 3 then 'Third'
           when extract(quarter from datum) = 4 then 'Fourth'
           end                                                                                as quarter_name,
       extract(year from datum)                                                               as year_actual,
       datum + (1 - extract(isodow from datum))::int                                          as first_day_of_week,
       datum + (7 - extract(isodow from datum))::int                                          as last_day_of_week,
       datum + (1 - extract(day from datum))::int                                             as first_day_of_month,
       (date_trunc('month', datum) + interval '1 month - 1 day')::date                        as last_day_of_month,
       date_trunc('quarter', datum)::date                                                     as first_day_of_quarter,
       (date_trunc('quarter', datum) + interval '3 month - 1 day')::date                      as last_day_of_quarter,
       to_date(extract(year from datum) || '-01-01', 'YYYY-MM-DD')                            as first_day_of_year,
       to_date(extract(year from datum) || '-12-31', 'YYYY-MM-DD')                            as last_day_of_year,
       to_char(datum, 'mmyyyy')                                                               as mmyyyy,
       to_char(datum, 'mmddyyyy')                                                             as mmddyyyy,
       case
           when extract(isodow from datum) in (6, 7) then true
           else false
           end                                                                                as weekend_indr
from (select '1970-01-01'::date + sequence.day as datum
      from generate_series(0, 29219) as sequence (day)
      group by sequence.day) dq
order by 1;

create table aphrodite.users
(
    user_hash         varchar(256),
    created_timestamp timestamp default now(),
    primary key (user_hash)
);

create index users_created_timestamp on aphrodite.users (created_timestamp);

create table aphrodite.marker_types
(
    marker_type_id   bigint,
    marker_type_name varchar(20),
    primary key (marker_type_id)
);

insert into aphrodite.marker_types (marker_type_id, marker_type_name)
values (1, 'RED'),
       (2, 'BLUE');

create table aphrodite.operations
(
    operation_id   bigint,
    operation_name varchar(20),
    primary key (operation_id)
);

insert into aphrodite.operations (operation_id, operation_name)
values (1, 'ADD'),
       (2, 'REMOVE');

create table aphrodite.markers
(
    marker_id         serial,
    created_timestamp timestamp default now(),
    user_hash         varchar(256),
    marker_date       date,
    operation_id      bigint,
    marker_type_id    bigint,
    primary key (marker_id),
    foreign key (user_hash) references aphrodite.users (user_hash),
    foreign key (marker_date) references aphrodite.dates (date_actual),
    foreign key (operation_id) references aphrodite.operations (operation_id),
    foreign key (marker_type_id) references aphrodite.marker_types (marker_type_id)
);

create index markers_marker_date on aphrodite.markers (marker_date);
create index markers_created_timestamp on aphrodite.markers (created_timestamp);

create or replace function aphrodite.get_calendar(p_user_hash varchar)
    returns table
            (
                calendar_date   date,
                "user"          varchar,
                has_red_marker  int,
                has_blue_marker int
            )
    language plpgsql
as
$func$
begin
    return query
        with numbered_markers as (select m.marker_date,
                                         m.user_hash,
                                         mt.marker_type_name,
                                         o.operation_name,
                                         row_number()
                                         over (partition by m.user_hash, m.marker_date, m.marker_type_id order by m.created_timestamp desc) as rn
                                  from aphrodite.markers m
                                           join aphrodite.marker_types mt on mt.marker_type_id = m.marker_type_id
                                           join aphrodite.operations o on o.operation_id = m.operation_id
                                  where m.user_hash = p_user_hash),

             narrowed_markers as (select d.date_actual as marker_date,
                                         nm.user_hash,
                                         nm.marker_type_name
                                  from aphrodite.dates d
                                           join numbered_markers nm
                                                on d.date_actual = nm.marker_date

                                  where nm.rn = 1
                                    and nm.operation_name = 'ADD')

        select marker_date,
               user_hash,
               sum(case
                       when marker_type_name = 'RED'
                           then 1
                       else 0
                   end)::int as red_marker,
               sum(case
                       when marker_type_name = 'BLUE'
                           then 1
                       else 0
                   end)::int as blue_marker
        from narrowed_markers
        group by 1, 2;
end
$func$;
