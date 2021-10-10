create table suffix (
	id serial primary key not null,
    suffix varchar,
    description varchar
);

create table preffix (
    id serial primary key not null,
    preffix varchar,
    description varchar
);

create table machine (
	id serial primary key not null,
    machine_tag varchar,
    name varchar
);

create table tag (
	id serial primary key not null,
    number integer,
    detail varchar,
    machine_id integer,
    foreign key (machine_id) references machine(id)
);

insert into suffix values (1, 'ff', 'Falha no fechamento');
insert into suffix values (2, 'fa', 'Falha na abertura');
insert into suffix values (3, 'fg', 'Falha geral');

insert into preffix values (1, 'VOC', 'Válvula');
insert into preffix values (2, 'B', 'Bomba');
insert into preffix values (3, 'MOT', 'Motor');

insert into machine values (1, 'Alm_brasscip', 'CIP');
insert into machine values (2, 'Alm_cozmosto', 'Cozinhador de Mosto');
insert into machine values (3, 'Alm_whirlpool', 'Whirlpool');

insert into tag values (1, '312999', 'dreno mosto', 2);
insert into tag values (2, '312990', 'avanço agua quente', 2);
insert into tag values (3, '312187', 'agua quente para whirlpool', 1);