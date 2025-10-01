export const up = (pgm) => {
  pgm.createExtension(''pgcrypto'', { ifNotExists: true });

  pgm.createTable(''users'', {
    id: {
      type: ''uuid'',
      primaryKey: true,
      default: pgm.func(''gen_random_uuid()''),
    },
    email: {
      type: ''varchar(255)'',
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: ''varchar(255)'',
      notNull: true,
    },
    created_at: {
      type: ''timestamp'',
      notNull: true,
      default: pgm.func(''current_timestamp''),
    },
    updated_at: {
      type: ''timestamp'',
      notNull: true,
      default: pgm.func(''current_timestamp''),
    },
  });
  pgm.createIndex(''users'', ''email'');

  pgm.createTable(''products'', {
    id: {
      type: ''uuid'',
      primaryKey: true,
      default: pgm.func(''gen_random_uuid()''),
    },
    user_id: {
      type: ''uuid'',
      notNull: true,
      references: ''users'',
      onDelete: ''CASCADE'',
    },
    name: {
      type: ''varchar(255)'',
      notNull: true,
    },
    description: {
      type: ''text'',
    },
    price: {
      type: ''integer'',
      notNull: true,
      check: ''price >= 0'',
    },
    active: {
      type: ''boolean'',
      default: true,
    },
    created_at: {
      type: ''timestamp'',
      notNull: true,
      default: pgm.func(''current_timestamp''),
    },
    updated_at: {
      type: ''timestamp'',
      notNull: true,
      default: pgm.func(''current_timestamp''),
    },
  });
  pgm.createIndex(''products'', ''user_id'');
  pgm.createIndex(''products'', ''active'');

  pgm.createTable(''orders'', {
    id: {
      type: ''uuid'',
      primaryKey: true,
      default: pgm.func(''gen_random_uuid()''),
    },
    product_id: {
      type: ''uuid'',
      notNull: true,
      references: ''products'',
    },
    email: {
      type: ''varchar(255)'',
      notNull: true,
    },
    name: {
      type: ''varchar(255)'',
    },
    status: {
      type: ''varchar(50)'',
      notNull: true,
      check: "status IN ('created', 'processing', 'paid', 'refunded', 'cancelled')",
    },
    amount: {
      type: ''integer'',
      notNull: true,
      check: ''amount >= 0'',
    },
    created_at: {
      type: ''timestamp'',
      notNull: true,
      default: pgm.func(''current_timestamp''),
    },
  });
  pgm.createIndex(''orders'', ''email'');
  pgm.createIndex(''orders'', ''status'');
  pgm.createIndex(''orders'', ''created_at'');

  pgm.createTable(''funnels'', {
    id: {
      type: ''uuid'',
      primaryKey: true,
      default: pgm.func(''gen_random_uuid()''),
    },
    user_id: {
      type: ''uuid'',
      notNull: true,
      references: ''users'',
      onDelete: ''CASCADE'',
    },
    name: {
      type: ''varchar(255)'',
      notNull: true,
    },
    config: {
      type: ''jsonb'',
      notNull: true,
    },
    published: {
      type: ''boolean'',
      default: false,
    },
    created_at: {
      type: ''timestamp'',
      notNull: true,
      default: pgm.func(''current_timestamp''),
    },
    updated_at: {
      type: ''timestamp'',
      notNull: true,
      default: pgm.func(''current_timestamp''),
    },
  });
  pgm.createIndex(''funnels'', ''user_id'');
  pgm.createIndex(''funnels'', ''published'');

  pgm.createTable(''emotions'', {
    id: {
      type: ''uuid'',
      primaryKey: true,
      default: pgm.func(''gen_random_uuid()''),
    },
    user_id: {
      type: ''uuid'',
      references: ''users'',
      onDelete: ''SET NULL'',
    },
    funnel_id: {
      type: ''uuid'',
      notNull: true,
      references: ''funnels'',
      onDelete: ''CASCADE'',
    },
    session_id: {
      type: ''varchar(255)'',
      notNull: true,
    },
    emotion_type: {
      type: ''varchar(50)'',
      notNull: true,
      check: "emotion_type IN ('joy', 'sadness', 'fear', 'anger', 'surprise', 'disgust', 'neutral')",
    },
    intensity: {
      type: ''decimal(3,2)'',
      notNull: true,
      check: ''intensity >= 0 AND intensity <= 1'',
    },
    confidence: {
      type: ''decimal(3,2)'',
      notNull: true,
      check: ''confidence >= 0 AND confidence <= 1'',
    },
    context: {
      type: ''jsonb'',
    },
    created_at: {
      type: ''timestamp'',
      notNull: true,
      default: pgm.func(''current_timestamp''),
    },
  });
  pgm.createIndex(''emotions'', ''funnel_id'');
  pgm.createIndex(''emotions'', ''session_id'');
  pgm.createIndex(''emotions'', ''created_at'');
  pgm.createIndex(''emotions'', ''emotion_type'');
};

export const down = (pgm) => {
  pgm.dropTable(''emotions'');
  pgm.dropTable(''funnels'');
  pgm.dropTable(''orders'');
  pgm.dropTable(''products'');
  pgm.dropTable(''users'');
  pgm.dropExtension(''pgcrypto'');
};
