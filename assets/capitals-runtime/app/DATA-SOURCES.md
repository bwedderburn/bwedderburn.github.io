# Capitals geography data

The catalog is an offline educational dataset reviewed on **29 October 2026**.
It is generated from `data/catalog-input.json` by
`python3 scripts/build-capitals-catalog.py` from the repository root. Use
`--check` to verify reproducibility without writing files. The builder uses only
Python's standard library and makes no network requests. The badge loads plain
Python literals from `catalog.py`; it does not load the source JSON, fetch data,
or import host geography packages.

## Coverage and identifiers

`WORLD` contains the 193 [UN member states](https://www.un.org/en/about-us/member-states)
and the two [UN observer states](https://www.un.org/en/about-us/non-member-states):
195 entries. This is an explicit educational scope, not a claim that every
possible definition of a country produces the same list. The Holy See observer
is represented by its territorial city-state, Vatican City, using ISO code VA;
the note makes that distinction visible. Palestine uses PS. Other world IDs are
ISO 3166-1 alpha-2 codes. Dependent territories and other disputed entities are
not silently counted as additional sovereign countries.

`STATES` contains exactly the 50 U.S. states. `TERRITORIES` separately contains
the five inhabited U.S. territories: American Samoa, Guam, Northern Mariana
Islands, Puerto Rico and U.S. Virgin Islands. `DISTRICTS` contains Washington,
D.C.'s federal district separately. These use IDs `US-XX`, with postal territory
codes AS/GU/MP/PR/VI and DC. The combined `BANKS['us']` has 56 entries. The
complete catalog has 251 unique IDs. The nine uninhabited U.S. Minor Outlying
Islands have no ordinary territorial capital and are outside this inhabited
territory quiz. Palau, Micronesia and Marshall Islands are independent countries
in the World bank, not U.S. territories.

World regions and subregions come from [UN M49](https://unstats.un.org/unsd/methodology/m49/overview/).
The Americas are split into North America (Northern America, Central America
and Caribbean) and South America for continent navigation. Africa's M49
intermediate regions are used where provided. Every country has one statistical
region: for example, Cyprus, Türkiye, Armenia, Georgia and Azerbaijan are in
Western Asia, while Russia is in Eastern Europe. This follows M49's grouping
convention and does not resolve political boundaries. Antarctica has no sovereign
countries or capital records; a map page can explain that without adding a fake
quiz entry. U.S. states use the Census Northeast/Midwest/South/West grouping;
territories use Caribbean/Pacific, and DC uses Federal district.

## Names, coordinates and licenses

General country/capital names and all representative settlement coordinates
come from [GeoNames country information](https://www.geonames.org/countries/)
and its [downloadable gazetteer](https://download.geonames.org/export/dump/).
The reviewed source snapshot stores each selected GeoNames place ID, settlement
name, coordinates, feature code, country and state code. `lat` and `lon` are
**capital or named seat settlement representative points in decimal degrees**,
not country centroids, boundary geometry or exact government-building locations.
For an atoll/island capital, they identify its representative capital settlement.
They are suitable for an educational locator, not navigation. Washington, D.C.
intentionally has the same point in the World U.S. record and the separate
federal-district record.

GeoNames data is used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
with attribution to [GeoNames](https://www.geonames.org/).
See its [data terms](https://www.geonames.org/export/). Source URLs, retrieval
date and SHA256 hashes of the downloaded inputs are recorded in
`data/catalog-input.json`. The selected records are bundled there for exact,
offline rebuilding; the large upstream city archive is not bundled. Corrections,
short display names, capital-role questions and explanatory notes are editorial
changes made for this app. The U.S. state/capital pairs were checked against the
[U.S. Government Publishing Office's states/capitals reference](https://www.govinfo.gov/content/pkg/GPO-STYLEMANUAL-2016/pdf/GPO-STYLEMANUAL-2016-20.pdf).
The state grouping convention is from the
[U.S. Census regional reference](https://www2.census.gov/geo/pdfs/maps-data/maps/reference/us_regdiv.pdf).

`name` and `capital` preserve proper Latin-script names and accents. Host-built
`display_name` and `display_capital` provide readable ASCII fallbacks for badge
fonts whose glyph support has not been verified. `sort_key` is the lowercase
ASCII name for stable alphabetical order. `aliases` contains selected common
spellings; it never treats another capital role as a spelling alias.
`question` is the authoritative wording for a quiz; do not reconstruct a generic
"capital of" question for records with a role-specific question. `note` explains
the role on learning/feedback pages. The snapshot exports `SCHEMA_VERSION = 1`
and `DATA_AS_OF = '2026-10-29'` (`DATA_DATE` is an alias).

## Capital exceptions and recent changes

The following cases are deliberately phrased to have one correct answer. Notes
retain the other capital roles instead of marking a legitimate alternate role
as a spelling error. Statements below paraphrase the linked primary sources.

| Entry | Quiz answer and policy | Sources checked |
| --- | --- | --- |
| Bolivia | Ask for constitutional capital, **Sucre**; distinguish La Paz's government seat. | [Bolivian embassy](https://bolivianembassy.ca/bolivia/el-pais/datos-generales/), [Constitution, Article 6](https://www.oas.org/dil/esp/constitucion_bolivia.pdf) |
| South Africa | Ask for administrative capital, **Pretoria**; note legislative Cape Town and judicial Bloemfontein. | [South African Government](https://www.gov.za/about-sa/south-africas-provinces) |
| Eswatini | Ask for administrative capital, **Mbabane**; note royal/legislative Lobamba. | [Eswatini Investment Promotion Authority](https://investeswatini.org.sz/quick-facts/), [African Union](https://au.int/en/cities/lobambaroyal-and-legislative-mbabane-administrative) |
| Sri Lanka | Ask where Parliament sits, **Sri Jayewardenepura Kotte**; note Colombo's commercial role. The GeoNames default Colombo is corrected. | [Sri Lankan Parliament](https://www.parliament.lk/files/pdf/parliament-booklet-v2019.pdf), [Sri Lankan embassy profile](https://www.emb-amman.gov.lk/en/sri-lanka-profile) |
| Switzerland | Ask for the federal city, **Bern**; do not claim a formally designated national capital. | [Swiss federal foreign affairs department](https://www.aboutswitzerland.eda.admin.ch/en/political-system) |
| Nauru | Ask for the government district, **Yaren**; the country has no official capital city. | [UNCTAD](https://dgff2021.unctad.org/nauru/), [Australian Army education reference](https://cove.army.gov.au/article/kyr-nauru-information) |
| Netherlands | Ask for constitutional capital, **Amsterdam**; distinguish The Hague's government seat. | [Dutch Government publication](https://www.government.nl/binaries/government/documenten/publications/2017/04/21/culture-at-a-first-glance/CIB2015_ENG_publicatie_v8_DEF.pdf) |
| Malaysia | Ask for national capital, **Kuala Lumpur**; note administrative Putrajaya. | [Malaysia's National Security Council](https://www.mkn.gov.my/web/ms/2022/09/13/tinta-bicara-hari-malaysia-kenali-wilayah-persekutuan/), [Prime Minister's Office](https://www.pmo.gov.my/en/perdana-putra/) |
| Benin | Ask for official capital, **Porto-Novo**; note Cotonou's government seat. | [Benin local-government ministry](https://www.decentralisation.gouv.bj/commune/62/porto-novo/), [World Bank country reference](https://thedocs.worldbank.org/en/doc/8f072d1eb361ca44b32f1d50ab12370f-0330202020/original/Rapport-Annuel-2020-du-Bureau-de-l-Administrateur.pdf) |
| Côte d'Ivoire | Ask for political capital, **Yamoussoukro**; distinguish economic Abidjan. | [Presidency](https://www.presidence.ci/la-cote-divoire/notre-patrimoine-2/) |
| Burundi | Ask for political capital, **Gitega**; distinguish economic Bujumbura. | [Burundi Presidency](https://presidence.gov.bi/le-pays/) |
| Egypt | Ask for constitutionally named capital, **Cairo**; explain the New Capital government-office move separately. | [Egyptian embassy, Article 222](https://egyptembassy.net/egypt-today/egypts-government/progressive-constitution/), [State Information Service constitution](https://sis.gov.eg/en/egypt/constitution-of-egypt/) |
| Indonesia | **Jakarta**, pending the presidential transfer decree; the note names planned Nusantara. This is a dated record, not a prediction of a transfer. | [Constitutional Court, May 2026](https://en.mkri.id/news/details/2026-05-12/Capital_Relocation_Depends_on_Issuance_of_Presidential_Decree), [Nusantara authority, July 2026 target](https://ikn.go.id/id/posts/pembangunan-tahap-ii-ikn-terus-berjalan-otorita-ikn-lakukan-evaluasi-berkala) |
| Equatorial Guinea | **Ciudad de la Paz**, proclaimed on 2 January 2026, replaces Malabo. The GeoNames point uses the new city record. | [Official government proclamation](https://www.guineaecuatorialpress.com/noticias/el_presidente_de_la_republica_proclama_la_ciudad_de_la_paz_como_capital_de_la_republica_de_guinea_ecuatorial_con_la_firma_de_un_decreto_ley) |
| Kiribati | **South Tarawa**, the capital area on Tarawa atoll; preserve Tarawa as an alias. | [Kiribati Finance Ministry](https://mfed.gov.ki/index.php/node/43) |
| Palestine | Ask for its **claimed capital, East Jerusalem**; note Ramallah's administrative role and disputed status. | [Palestinian Presidency, September 2026](https://www.president.ps/Eng/NewsPage/493162), [Ramallah Municipality](https://www.ramallah.ps/en/Category/61) |
| Israel | Ask for its **declared capital, Jerusalem**; note that Jerusalem's status is internationally disputed. This teaches a declared designation without resolving sovereignty. | [Knesset basic-law reference](https://m.knesset.gov.il/en/activity/pages/basiclaws.aspx), [UN position on Jerusalem](https://www.un.org/unispal/permanent-status-issues/) |

Tanzania's note distinguishes Dodoma from former capital Dar es Salaam. Yemen's
question asks for the constitutional capital Sana'a rather than treating an
interim seat as a second interchangeable answer; see the
[Yemen UN mission's explanation](https://www.un.int/yemen/about). Tuvalu's note
explains that Funafuti is an atoll and government offices are on Fongafale; see
the [UN geographical-names reference](https://ungegn.un.org/dashboard/cities/details?id=120).
These distinctions do not imply that every government office physically operates
at the representative settlement point.

## U.S. territory and district treatment

| Set entry | Answer and distinction | Primary references |
| --- | --- | --- |
| American Samoa | **Pago Pago**, asked as historic capital; **Fagatogo** is explicitly identified as the constitutional seat of government. | [NOAA territory background](https://www.weather.gov/peac/am_samoa), [Revised Constitution, Article V section 9](https://asbar.org/revised-constitution-of-american-samoa/), [Australian foreign affairs brief](https://www.dfat.gov.au/geo/american-samoa/american-samoa-country-brief) |
| Guam | **Hagåtña**, with Hagatna/Agana/Agaña spelling aliases. | [Mayors Council of Guam](https://www.mcog.guam.gov/villages-list?keyword=capital), [Library of Congress](https://guides.loc.gov/guam-state-guide/introduction) |
| Northern Mariana Islands | **Saipan**, asked as the capital island; note Capitol Hill government offices. | [CNMI Governor's consolidated plan](https://governor.gov.mp/gov_content/uploads/2021/04/Final-ConPlan-2020-2024.pdf?x81055=), [Australian foreign affairs brief](https://www.dfat.gov.au/geo/commonwealth-of-northern-mariana-islands/Pages/commonwealth-of-the-northern-mariana-islands-country-brief) |
| Puerto Rico | **San Juan**. | [San Juan municipal government](https://www.sanjuan.pr/), [GPO states/capitals reference](https://www.govinfo.gov/content/pkg/GPO-STYLEMANUAL-2016/pdf/GPO-STYLEMANUAL-2016-20.pdf) |
| U.S. Virgin Islands | **Charlotte Amalie**, on St. Thomas. | [48 U.S.C. 1541(b)](https://uscode.house.gov/us/usc/119-118/t48/s1541/) |
| District of Columbia | **Washington, D.C.**, asked as U.S. federal capital; not a state or inhabited territory. | [GPO states/capitals reference](https://www.govinfo.gov/content/pkg/GPO-STYLEMANUAL-2016/pdf/GPO-STYLEMANUAL-2016-20.pdf) |

## Updating and testing

Review current official sources before changing a capital or the coverage date.
Update the selected input records/notes and their provenance, then regenerate
the literal module. Never silently refresh an upstream daily dump during a test
or a badge launch. A future full source refresh should download countryInfo,
cities5000 and M49 from the recorded URLs, retain the download hashes, and review
editorial exceptions rather than dropping them through an automatic join.

`tests/test_capitals_catalog.py` independently checks the full World/state ID
sets, separate territories/DC, complete region counts, sourced coordinate parity,
role wording, recent changes, Unicode/ASCII display preservation, plain-literal
runtime compatibility and exact offline rebuild. The quiz/map/UI suites should
add traversal, projection and physical checks; data tests alone do not prove
that all entries render or are reachable on the badge.
