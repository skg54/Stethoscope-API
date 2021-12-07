create table users
(
  guid serial primary key,
  name text,
  photo text,
  email text,
  password text,
  CONSTRAINT users_pkey PRIMARY KEY (guid)
);

create table uploads
(
  id serial primary key,
  name text,
  guid integer references users(guid),
  patient_id integer references patients(id),
  url text,
  region text,
  duration integer,
  "timestamp" timestamp without time zone DEFAULT now()
);

create table patients(
  id serial primary key,
  group_id integer references groups(id),
  guid integer references users(guid),
  name text,
  dob text,
  "timestamp" timestamp without time zone DEFAULT now()
);

create table groups(
  id serial primary key,
  guid integer references users(guid),
  name text,
  name text,
  "timestamp" timestamp without time zone DEFAULT now()
);

