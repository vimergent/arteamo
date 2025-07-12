// Centralized project configuration for all galleries
// This ensures all projects are consistently available across all website variations

const projectConfig = {
    'Apartament Flavia Garden 2024': {
        name: {
            bg: 'Апартамент Флавия Гардън',
            en: 'Flavia Garden Apartment',
            ru: 'Апартамент Флавия Гарден',
            es: 'Apartamento Flavia Garden'
        },
        subtitle: {
            bg: 'Модерен Дом',
            en: 'Modern Living',
            ru: 'Современная Жизнь',
            es: 'Vida Moderna'
        },
        description: {
            bg: 'Модерно убежище, съчетаващо елегантност с комфорт в сърцето на Варна.',
            en: 'A modern sanctuary combining elegance with comfort in the heart of Varna.',
            ru: 'Современное убежище, сочетающее элегантность и комфорт в сердце Варны.',
            es: 'Un santuario moderno que combina elegancia con comodidad en el corazón de Varna.'
        },
        category: 'residential',
        year: 2024,
        area: 120,
        coverImage: 'cam01.jpg',
        images: ['cam01.jpg', 'cam02.jpg', 'cam03.jpg', 'cam04.jpg', 'cam05.jpg', 'cam06.jpg', 'cam07.jpg', 'cam08.jpg', 'cam09.jpg', 'cam010.jpg', 'cam011.jpg', 'cam012.jpg', 'cam013.jpg', 'cam014.jpg', 'cam015.jpg', 'cam016.jpg', 'cam017.jpg', 'cam018.jpg', 'cam019.jpg', 'cam020.jpg', 'cam021.jpg', 'cam022.jpg', 'cam023.jpg', 'cam024_1.jpg', 'cam025_1.jpg', 'cam026_1.jpg', 'cam028_1.jpg', 'cam029_1.jpg', 'cam030_1.jpg']
    },
    'Elite Clinic 2021': {
        name: {
            bg: 'Елит Клиник',
            en: 'Elite Clinic',
            ru: 'Элит Клиник',
            es: 'Clínica Elite'
        },
        subtitle: {
            bg: 'Медицинско Съоръжение',
            en: 'Medical Facility',
            ru: 'Медицинское Учреждение',
            es: 'Instalación Médica'
        },
        description: {
            bg: 'Модерно медицинско съоръжение, проектирано за комфорт на пациентите и клинична ефективност.',
            en: 'A state-of-the-art medical facility designed for patient comfort and clinical efficiency.',
            ru: 'Современное медицинское учреждение, спроектированное для комфорта пациентов и клинической эффективности.',
            es: 'Una instalación médica de última generación diseñada para la comodidad del paciente y la eficiencia clínica.'
        },
        category: 'medical',
        year: 2021,
        area: 250,
        coverImage: 'Cam09.jpg',
        images: ['Cam01.jpg', 'Cam02.jpg', 'Cam03.jpg', 'Cam04.jpg', 'Cam05.jpg', 'Cam06.jpg', 'Cam07.jpg', 'Cam08.jpg', 'Cam09.jpg', 'Cam010.jpg', 'Cam011.jpg', 'Cam012.jpg', 'Cam013.jpg', 'Cam014.jpg', 'Cam015.jpg', 'Cam016.jpg', 'Cam017.jpg']
    },
    'Apartament K55_2021': {
        name: {
            bg: 'Апартамент K55',
            en: 'Apartment K55',
            ru: 'Апартамент K55',
            es: 'Apartamento K55'
        },
        subtitle: {
            bg: 'Минималистичен Дизайн',
            en: 'Minimalist Design',
            ru: 'Минималистичный Дизайн',
            es: 'Diseño Minimalista'
        },
        description: {
            bg: 'Съвременно жилищно пространство с минималистична естетика и максимална функционалност.',
            en: 'Contemporary living space with minimalist aesthetics and maximum functionality.',
            ru: 'Современное жилое пространство с минималистичной эстетикой и максимальной функциональностью.',
            es: 'Espacio de vida contemporáneo con estética minimalista y máxima funcionalidad.'
        },
        category: 'residential',
        year: 2021,
        area: 95,
        coverImage: 'Vladi (4).jpg',
        images: ['Vladi (1).jpg', 'Vladi (2).jpg', 'Vladi (3).jpg', 'Vladi (4).jpg', 'Vladi (5).jpg', 'Vladi (6).jpg', 'Vladi (7).jpg', 'Vladi (8).jpg', 'Vladi (9).jpg', 'Vladi (10).jpg']
    },
    'Balev Corporation 2020': {
        name: {
            bg: 'Балев Корпорация',
            en: 'Balev Corporation',
            ru: 'Балев Корпорация',
            es: 'Corporación Balev'
        },
        subtitle: {
            bg: 'Корпоративен Офис',
            en: 'Corporate Office',
            ru: 'Корпоративный Офис',
            es: 'Oficina Corporativa'
        },
        description: {
            bg: 'Динамична корпоративна централа, отразяваща иновации и професионализъм.',
            en: 'A dynamic corporate headquarters reflecting innovation and professionalism.',
            ru: 'Динамичная корпоративная штаб-квартира, отражающая инновации и профессионализм.',
            es: 'Una sede corporativa dinámica que refleja innovación y profesionalismo.'
        },
        category: 'office',
        year: 2020,
        area: 450,
        coverImage: 'Balev (1).jpg',
        images: ['Balev (1).jpg', 'Balev (2).jpg', 'Balev (3).jpg', 'Balev (4).jpg', 'Balev (5).jpg', 'Balev (6).jpg']
    },
    'Apartament Симфония - Бриз, Варна_ 2019': {
        name: {
            bg: 'Симфония Бриз',
            en: 'Symphony Breeze',
            ru: 'Симфония Бриз',
            es: 'Sinfonía Brisa'
        },
        subtitle: {
            bg: 'Крайбрежен Лукс',
            en: 'Coastal Luxury',
            ru: 'Прибрежная Роскошь',
            es: 'Lujo Costero'
        },
        description: {
            bg: 'Крайбрежната елегантност среща градската изтънченост в този морски апартамент.',
            en: 'Coastal elegance meets urban sophistication in this seaside apartment.',
            ru: 'Прибрежная элегантность встречается с городской изысканностью в этой приморской квартире.',
            es: 'La elegancia costera se encuentra con la sofisticación urbana en este apartamento junto al mar.'
        },
        category: 'residential',
        year: 2019,
        area: 110,
        coverImage: 'Alex (1).jpg',
        images: ['Alex (1).jpg', 'Alex (2).jpg', 'Alex (3).jpg', 'Alex (4).jpg', 'Alex (5).jpg', 'Alex (6).jpg', 'Alex (7).jpg', 'Alex (8).jpg', 'Alex (9).jpg', 'Alex (10).jpg', 'Alex (11).jpg', 'Alex (12).jpg', 'Alex (13).jpg', 'Alex (14).jpg', 'Alex (15).jpg', 'Alex (16).jpg', 'cam016.jpg', 'cam017.jpg', 'cam018.jpg', 'cam020.jpg']
    },
    'Oliv vilas sv.Vlas 2019': {
        name: {
            bg: 'Олив Вили',
            en: 'Oliv Villas',
            ru: 'Олив Виллы',
            es: 'Villas Oliv'
        },
        subtitle: {
            bg: 'Луксозни Вили',
            en: 'Luxury Villas',
            ru: 'Роскошные Виллы',
            es: 'Villas de Lujo'
        },
        description: {
            bg: 'Луксозни ваканционни вили, проектирани за пълна релаксация и комфорт.',
            en: 'Luxury vacation villas designed for ultimate relaxation and comfort.',
            ru: 'Роскошные виллы для отдыха, созданные для полного расслабления и комфорта.',
            es: 'Villas vacacionales de lujo diseñadas para la máxima relajación y comodidad.'
        },
        category: 'hospitality',
        year: 2019,
        area: 800,
        coverImage: '7O.V..jpg',
        images: ['1O.V..jpg', '2O.V..jpg', '3O.V..jpg', '4O.V..jpg', '5O.V..jpg', '7O.V..jpg', '8O.V..jpg', '9O.V..jpg', '10O.V..jpg', '11O.V..jpg', '12O.V..jpg']
    },
    'Playground Grand Mall Varna 2018': {
        name: {
            bg: 'Плейграунд Гранд Мол',
            en: 'Playground Grand Mall',
            ru: 'Плейграунд Гранд Молл',
            es: 'Playground Grand Mall'
        },
        subtitle: {
            bg: 'Детски Център',
            en: 'Entertainment Center',
            ru: 'Развлекательный Центр',
            es: 'Centro de Entretenimiento'
        },
        description: {
            bg: 'Иновативен детски развлекателен център, носещ радост на семействата.',
            en: 'An innovative children\'s entertainment center bringing joy to families.',
            ru: 'Инновационный детский развлекательный центр, приносящий радость семьям.',
            es: 'Un innovador centro de entretenimiento infantil que trae alegría a las familias.'
        },
        category: 'commercial',
        year: 2018,
        area: 350,
        coverImage: 'Playground (6).jpg',
        images: ['Playground (1).jpg', 'Playground (2).jpg', 'Playground (3).jpg', 'Playground (4).jpg', 'Playground (5).jpg', 'Playground (6).jpg', 'Playground (7).jpg', 'Playground (8).jpg', 'Playground (9).jpg', 'Playground (10).jpg', 'Playground (11).jpg', 'Playground (12).jpg', 'Playground (13).jpg', 'Playground (14).jpg', 'Playground (15).jpg']
    },
    'Apartament Кв. Чайка, Варна_2017': {
        name: {
            bg: 'Квартал Чайка',
            en: 'Chayka District',
            ru: 'Район Чайка',
            es: 'Distrito Chayka'
        },
        subtitle: {
            bg: 'Семеен Дом',
            en: 'Family Living',
            ru: 'Семейная Жизнь',
            es: 'Vida Familiar'
        },
        description: {
            bg: 'Топъл семеен дом, балансиращ традиционния чар с модерното удобство.',
            en: 'A warm family home balancing traditional charm with modern convenience.',
            ru: 'Теплый семейный дом, сочетающий традиционный шарм с современным удобством.',
            es: 'Un cálido hogar familiar que equilibra el encanto tradicional con la comodidad moderna.'
        },
        category: 'residential',
        year: 2017,
        area: 85,
        coverImage: 'Dnevna01.jpg',
        images: ['Dnevna01.jpg', 'Dnevna02.jpg', 'Dnevna04.jpg', 'Fotev (2).jpg', 'Fotev (3).jpg', 'Fotev (5).jpg']
    },
    'Apartament Траката, Варна_2021': {
        name: {
            bg: 'Резиденция Траката',
            en: 'Trakata Residence',
            ru: 'Резиденция Траката',
            es: 'Residencia Trakata'
        },
        subtitle: {
            bg: 'Модерен Живот',
            en: 'Modern Living',
            ru: 'Современная Жизнь',
            es: 'Vida Moderna'
        },
        description: {
            bg: 'Модерната елегантност среща комфорта в този изискан жилищен проект.',
            en: 'Modern elegance meets comfort in this sophisticated residential project.',
            ru: 'Современная элегантность встречается с комфортом в этом изысканном жилом проекте.',
            es: 'La elegancia moderna se encuentra con la comodidad en este sofisticado proyecto residencial.'
        },
        category: 'residential',
        year: 2021,
        area: 105,
        coverImage: '1-1-2000x1200.jpg',
        images: ['1-1-2000x1200.jpg', '2-1-768x545.jpg', '3-1-768x473.jpg', '4-1-768x666.jpg', '5-1-768x512.jpg', '6-1-768x581.jpg', '7-1-768x512.jpg', '8-1-768x689.jpg', '9-1-768x576.jpg', '10-1-768x512.jpg', '11-1-768x576.jpg', '12-1-768x512.jpg', '13-768x1132.jpg', '14-768x1024.jpg', '15-1-768x512.jpg', '16-768x1024.jpg', '17-768x1024.jpg', '18-768x1024.jpg', '19-768x1024.jpg', '20-768x1024.jpg', '21-768x1024.jpg', '22-768x1024.jpg', '23-768x1024.jpg', '24-768x1024.jpg', '25-768x1024.jpg']
    },
    'Gichev sped 2019': {
        name: {
            bg: 'Резиденция Гичев',
            en: 'Gichev Residence',
            ru: 'Резиденция Гичев',
            es: 'Residencia Gichev'
        },
        subtitle: {
            bg: 'Съвременен Дизайн',
            en: 'Contemporary Design',
            ru: 'Современный Дизайн',
            es: 'Diseño Contemporáneo'
        },
        description: {
            bg: 'Изискан семеен дом, демонстриращ съвременни дизайнерски принципи.',
            en: 'A refined family home showcasing contemporary design principles.',
            ru: 'Изысканный семейный дом, демонстрирующий современные принципы дизайна.',
            es: 'Un hogar familiar refinado que muestra principios de diseño contemporáneo.'
        },
        category: 'residential',
        year: 2019,
        area: 130,
        coverImage: 'GichevSped1 (1).jpg',
        images: ['GichevSped1 (1).jpg', 'GichevSped1 (2).jpg', 'GichevSped1 (3).jpg', 'GichevSped1 (4).jpg', 'GichevSped1 (5).jpg', 'GichevSped1 (6).jpg', 'GichevSped1 (7).jpg', 'GichevSped1 (8).jpg', 'GichevSped1 (9).jpg', 'GichevSped1 (10).jpg', 'GichevSped1 (11).jpg', 'GichevSped1 (12).jpg', 'GichevSped1 (13).jpg']
    },
    'Work Del Mar 2022': {
        name: {
            bg: 'Офис Дел Мар',
            en: 'Del Mar Office',
            ru: 'Офис Дель Мар',
            es: 'Oficina Del Mar'
        },
        subtitle: {
            bg: 'Модерно Работно Пространство',
            en: 'Modern Workspace',
            ru: 'Современное Рабочее Пространство',
            es: 'Espacio de Trabajo Moderno'
        },
        description: {
            bg: 'Модерен дизайн на работно пространство, насърчаващ продуктивността и благосъстоянието.',
            en: 'Modern workspace design promoting productivity and well-being.',
            ru: 'Современный дизайн рабочего пространства, способствующий продуктивности и благополучию.',
            es: 'Diseño de espacio de trabajo moderno que promueve la productividad y el bienestar.'
        },
        category: 'office',
        year: 2022,
        area: 200,
        coverImage: '1 (1).jpg',
        images: ['1 (1).jpg', '1 (2).jpg', '1 (3).jpg', '1 (4).jpg', '1 (5).jpg', '1 (6).jpg', '1 (7).jpg', '1 (8).jpg', '1 (9).jpg', '1 (10).jpg', '1 (11).jpg', '1 (12).jpg', '1 (13).jpg']
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = projectConfig;
}