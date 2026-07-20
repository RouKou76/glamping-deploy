import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const connectionString = 'postgresql://glamping:glamping_secret@localhost:5433/glamping?schema=public';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create roles
  const roles = [
    { name: 'admin', permissions: ['manage_users', 'manage_houses', 'manage_services', 'manage_menu', 'view_tickets', 'manage_tickets', 'manage_chat', 'manage_settings', 'manage_roles'] },
    { name: 'cook', permissions: ['view_tickets:food', 'view_tickets:minibar'] },
    { name: 'cleaning', permissions: ['view_tickets:cleaning'] },
    { name: 'driver', permissions: ['view_tickets:transfer'] },
  ];

  const roleMap: Record<string, string> = {};
  for (const role of roles) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: { permissions: role.permissions },
      create: role,
    });
    roleMap[role.name] = r.id;
  }

  // Create users for each role
  const passwordHash = await argon2.hash('admin123');
  const users = [
    { email: 'admin@glamping.com', name: 'Admin', roleName: 'admin' },
    { email: 'cook@glamping.com', name: 'Повар', roleName: 'cook' },
    { email: 'cleaning@glamping.com', name: 'Клининг', roleName: 'cleaning' },
    { email: 'driver@glamping.com', name: 'Водитель', roleName: 'driver' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        passwordHash,
        name: user.name,
        roleId: roleMap[user.roleName],
      },
    });
  }

  // Create houses
  for (let i = 1; i <= 8; i++) {
    await prisma.house.upsert({
      where: { number: i },
      update: {},
      create: { number: i },
    });
  }

  // Create menu items
  const menuItems = [
    // Завтрак (без подкатегорий)
    { name: 'Сырники из фермерского творога', category: 'breakfast', subcat: null, price: 450 },
    { name: 'Овсяная каша с ягодами', category: 'breakfast', subcat: null, price: 320 },
    { name: 'Яичница с беконом', category: 'breakfast', subcat: null, price: 380 },
    { name: 'Кофе', category: 'breakfast', subcat: null, price: 200 },
    { name: 'Чай зеленый', category: 'breakfast', subcat: null, price: 150 },
    { name: 'Чай черный', category: 'breakfast', subcat: null, price: 150 },
    { name: 'Горячий шоколад', category: 'breakfast', subcat: null, price: 250 },
    // Обед — Закуски/Салаты
    { name: 'Греческий салат', category: 'lunch', subcat: 'appetizers', price: 380 },
    { name: 'Цезарь с курицей', category: 'lunch', subcat: 'appetizers', price: 420 },
    // Обед — Горячее
    { name: 'Борщ со сметаной', category: 'lunch', subcat: 'hot', price: 420 },
    { name: 'Паста карбонара', category: 'lunch', subcat: 'hot', price: 550 },
    // Обед — Гарниры
    { name: 'Рис', category: 'lunch', subcat: 'sides', price: 120 },
    { name: 'Картофельное пюре', category: 'lunch', subcat: 'sides', price: 150 },
    // Обед — Десерты
    { name: 'Чизкейк', category: 'lunch', subcat: 'desserts', price: 350 },
    { name: 'Тирамису', category: 'lunch', subcat: 'desserts', price: 380 },
    // Обед — Напитки
    { name: 'Чай зеленый', category: 'lunch', subcat: 'drinks', price: 150 },
    { name: 'Чай черный', category: 'lunch', subcat: 'drinks', price: 150 },
    { name: 'Фруктовый компот', category: 'lunch', subcat: 'drinks', price: 180 },
    { name: 'Горячий шоколад', category: 'lunch', subcat: 'drinks', price: 250 },
    // Ужин — Закуски
    { name: 'Тартар из лосося', category: 'dinner', subcat: 'appetizers', price: 520 },
    { name: 'Капрезе', category: 'dinner', subcat: 'appetizers', price: 380 },
    // Ужин — Горячее
    { name: 'Стейк из форели', category: 'dinner', subcat: 'hot', price: 890 },
    { name: 'Утиная грудка с овощами', category: 'dinner', subcat: 'hot', price: 950 },
    // Ужин — Гарниры
    { name: 'Рис', category: 'dinner', subcat: 'sides', price: 120 },
    { name: 'Картофельное пюре', category: 'dinner', subcat: 'sides', price: 150 },
    // Ужин — Десерты
    { name: 'Чизкейк', category: 'dinner', subcat: 'desserts', price: 350 },
    { name: 'Тирамису', category: 'dinner', subcat: 'desserts', price: 380 },
    // Ужин — Напитки
    { name: 'Чай зеленый', category: 'dinner', subcat: 'drinks', price: 150 },
    { name: 'Чай черный', category: 'dinner', subcat: 'drinks', price: 150 },
    { name: 'Фруктовый компот', category: 'dinner', subcat: 'drinks', price: 180 },
    { name: 'Горячий шоколад', category: 'dinner', subcat: 'drinks', price: 250 },
    // Минибар
    { name: 'Кока-кола 0.33', category: 'minibar', subcat: null, price: 150 },
    { name: 'Вода Evian 0.5', category: 'minibar', subcat: null, price: 120 },
    { name: 'Пиво Paulaner 0.5', category: 'minibar', subcat: null, price: 320 },
    { name: 'Чипсы Lays', category: 'minibar', subcat: null, price: 180 },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({ where: { name: item.name, category: item.category as any } });
    if (!existing) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          category: item.category as any,
          subcat: item.subcat,
          price: item.price,
        },
      });
    }
  }

  // Create services
  const services = [
    {
      name: 'Русская баня',
      price: '3 000 ₽ / час',
      icon: '🛁',
      active: true,
      assignedTo: 'admin',
      fields: {
        desiredAt: { enabled: true, label: 'Удобное время' },
        guestCount: { enabled: true, label: 'Количество человек' },
        comment: { enabled: true },
      },
    },
    {
      name: 'Прокат велосипедов',
      price: '500 ₽ / час',
      icon: '🚲',
      active: true,
      assignedTo: 'admin',
      fields: {
        desiredAt: { enabled: true, label: 'Время начала' },
        guestCount: { enabled: true, label: 'Количество велосипедов' },
        catalog: { enabled: true, label: 'Выберите тип' },
      },
      items: [
        { id: 'bike1', name: 'Горный велосипед', price: 500, hidden: false },
        { id: 'bike2', name: 'Городской велосипед', price: 400, hidden: false },
        { id: 'bike3', name: 'Детский велосипед', price: 300, hidden: false },
      ],
    },
  ];

  for (const svc of services) {
    const existing = await prisma.service.findFirst({ where: { name: svc.name } });
    if (existing) {
      await prisma.service.update({ where: { id: existing.id }, data: { ...svc, assignedTo: svc.assignedTo as any } });
    } else {
      await prisma.service.create({ data: { ...svc, assignedTo: svc.assignedTo as any } });
    }
  }

  // Create transfer destinations
  const destinations = [
    { name: 'Суздаль', km: 45, price: 700 },
    { name: 'Южа', km: 62, price: 1000 },
    { name: 'Лух', km: 80, price: 1000 },
    { name: 'Иваново', km: 95, price: 1000 },
    { name: 'Владимир', km: 70, price: 1000 },
  ];

  for (const dest of destinations) {
    const existing = await prisma.transferDestination.findFirst({ where: { name: dest.name } });
    if (existing) {
      await prisma.transferDestination.update({ where: { id: existing.id }, data: dest });
    } else {
      await prisma.transferDestination.create({ data: dest });
    }
  }

  // Create settings
  const settings = [
    { key: 'phone', value: '+7 (999) 123-45-67' },
    { key: 'wifi_name', value: 'Glamp_Guest' },
    { key: 'wifi_password', value: 'forest2026' },
    { key: 'rules', value: '• Тихий час с 23:00 до 8:00\n• Курение только в отведённых местах\n• Выезд до 12:00' },
    { key: 'description', value: 'Добро пожаловать в наш глэмпинг! Здесь вы сможете насладиться природой без отрыва от комфорта.' },
    { key: 'services_text', value: 'Мы предоставляем: питание по меню, услуги трансфера, уборку домиков, пополнение мини-бара и свежие полотенца по запросу.' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
