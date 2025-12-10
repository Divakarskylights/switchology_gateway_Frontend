-- 
-- RelaySetup table schema for Switchology Gateway
-- Add this to your existing PostgreSQL database
--

--
-- Name: relaysetup; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.relaysetup (
    id integer NOT NULL,
    relay_number integer NOT NULL,
    mode character varying(20) DEFAULT 'NONE'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.relaysetup OWNER TO myuser;

--
-- Name: COLUMN relaysetup.relay_number; Type: COMMENT; Schema: public; Owner: myuser
--

COMMENT ON COLUMN public.relaysetup.relay_number IS 'Relay number (1-13) for hardware relay identification';

--
-- Name: COLUMN relaysetup.mode; Type: COMMENT; Schema: public; Owner: myuser
--

COMMENT ON COLUMN public.relaysetup.mode IS 'Relay mode: INPUT, OUTPUT, or NONE';

--
-- Name: relaysetup_id_seq; Type: SEQUENCE; Schema: public; Owner: myuser
--

CREATE SEQUENCE public.relaysetup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.relaysetup_id_seq OWNER TO myuser;

--
-- Name: relaysetup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myuser
--

ALTER SEQUENCE public.relaysetup_id_seq OWNED BY public.relaysetup.id;

--
-- Name: relaysetup id; Type: DEFAULT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.relaysetup ALTER COLUMN id SET DEFAULT nextval('public.relaysetup_id_seq'::regclass);

--
-- Name: relaysetup relaysetup_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.relaysetup
    ADD CONSTRAINT relaysetup_pkey PRIMARY KEY (id);

--
-- Name: relaysetup relaysetup_relay_number_key; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.relaysetup
    ADD CONSTRAINT relaysetup_relay_number_key UNIQUE (relay_number);

--
-- Name: relaysetup_mode_check; Type: CHECK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.relaysetup
    ADD CONSTRAINT relaysetup_mode_check CHECK (((mode)::text = ANY ((ARRAY['INPUT'::character varying, 'OUTPUT'::character varying, 'NONE'::character varying])::text[])));

--
-- Name: relaysetup_relay_number_range; Type: CHECK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.relaysetup
    ADD CONSTRAINT relaysetup_relay_number_range CHECK (((relay_number >= 1) AND (relay_number <= 13)));

--
-- Name: idx_relaysetup_relay_number; Type: INDEX; Schema: public; Owner: myuser
--

CREATE INDEX idx_relaysetup_relay_number ON public.relaysetup USING btree (relay_number);

--
-- Name: idx_relaysetup_mode; Type: INDEX; Schema: public; Owner: myuser
--

CREATE INDEX idx_relaysetup_mode ON public.relaysetup USING btree (mode);

--
-- Insert default configuration for all 13 relays (all set to NONE initially)
--

INSERT INTO public.relaysetup (relay_number, mode) VALUES
(1, 'NONE'),
(2, 'NONE'),
(3, 'NONE'),
(4, 'NONE'),
(5, 'NONE'),
(6, 'NONE'),
(7, 'NONE'),
(8, 'NONE'),
(9, 'NONE'),
(10, 'NONE'),
(11, 'NONE'),
(12, 'NONE'),
(13, 'NONE')
ON CONFLICT (relay_number) DO NOTHING;

--
-- Grant permissions to myuser (if needed)
--

GRANT ALL PRIVILEGES ON TABLE public.relaysetup TO myuser;
GRANT ALL PRIVILEGES ON SEQUENCE public.relaysetup_id_seq TO myuser;