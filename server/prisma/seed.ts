import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({
  adapter,
});

/**
 * System Roles
 */
const SYSTEM_ROLES = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    isSystem: true,
  },
  {
    code: 'ADMIN',
    name: 'Administrator',
    description: 'Administrative access with most permissions',
    isSystem: true,
  },
  {
    code: 'MANAGER',
    name: 'Manager',
    description: 'Management access with limited permissions',
    isSystem: true,
  },
  {
    code: 'USER',
    name: 'User',
    description: 'Basic user access',
    isSystem: true,
  },
];

/**
 * System Permissions
 */
const SYSTEM_PERMISSIONS = [
  // User Management
  { module: 'users', action: 'create', resource: 'user', description: 'Create users' },
  { module: 'users', action: 'read', resource: 'user', description: 'View users' },
  { module: 'users', action: 'update', resource: 'user', description: 'Update users' },
  { module: 'users', action: 'delete', resource: 'user', description: 'Delete users' },
  
  // Role Management
  { module: 'roles', action: 'create', resource: 'role', description: 'Create roles' },
  { module: 'roles', action: 'read', resource: 'role', description: 'View roles' },
  { module: 'roles', action: 'update', resource: 'role', description: 'Update roles' },
  { module: 'roles', action: 'delete', resource: 'role', description: 'Delete roles' },
  { module: 'roles', action: 'assign', resource: 'role', description: 'Assign roles to users' },
  
  // Permission Management
  { module: 'permissions', action: 'read', resource: 'permission', description: 'View permissions' },
  { module: 'permissions', action: 'assign', resource: 'permission', description: 'Assign permissions' },
  
  // Organization Management
  { module: 'organizations', action: 'read', resource: 'organization', description: 'View organization' },
  { module: 'organizations', action: 'update', resource: 'organization', description: 'Update organization' },
  
  // Location Management
  { module: 'locations', action: 'create', resource: 'location', description: 'Create locations' },
  { module: 'locations', action: 'read', resource: 'location', description: 'View locations' },
  { module: 'locations', action: 'update', resource: 'location', description: 'Update locations' },
  { module: 'locations', action: 'delete', resource: 'location', description: 'Delete locations' },
  
  // Department Management
  { module: 'departments', action: 'create', resource: 'department', description: 'Create departments' },
  { module: 'departments', action: 'read', resource: 'department', description: 'View departments' },
  { module: 'departments', action: 'update', resource: 'department', description: 'Update departments' },
  { module: 'departments', action: 'delete', resource: 'department', description: 'Delete departments' },
  
  // Session Management
  { module: 'sessions', action: 'read', resource: 'session', description: 'View sessions' },
  { module: 'sessions', action: 'revoke', resource: 'session', description: 'Revoke sessions' },
  
  // Audit Logs
  { module: 'audit', action: 'read', resource: 'audit_log', description: 'View audit logs' },
];

/**
 * Role-Permission Mappings
 */
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    // All permissions
    'users:create:user', 'users:read:user', 'users:update:user', 'users:delete:user',
    'roles:create:role', 'roles:read:role', 'roles:update:role', 'roles:delete:role', 'roles:assign:role',
    'permissions:read:permission', 'permissions:assign:permission',
    'organizations:read:organization', 'organizations:update:organization',
    'locations:create:location', 'locations:read:location', 'locations:update:location', 'locations:delete:location',
    'departments:create:department', 'departments:read:department', 'departments:update:department', 'departments:delete:department',
    'sessions:read:session', 'sessions:revoke:session',
    'audit:read:audit_log',
  ],
  ADMIN: [
    // Most permissions except system-level changes
    'users:create:user', 'users:read:user', 'users:update:user',
    'roles:read:role', 'roles:assign:role',
    'permissions:read:permission',
    'organizations:read:organization',
    'locations:create:location', 'locations:read:location', 'locations:update:location',
    'departments:create:department', 'departments:read:department', 'departments:update:department',
    'sessions:read:session', 'sessions:revoke:session',
    'audit:read:audit_log',
  ],
  MANAGER: [
    // Limited management permissions
    'users:read:user', 'users:update:user',
    'roles:read:role',
    'permissions:read:permission',
    'organizations:read:organization',
    'locations:read:location',
    'departments:read:department',
    'sessions:read:session',
  ],
  USER: [
    // Basic read permissions
    'users:read:user',
    'organizations:read:organization',
    'locations:read:location',
    'departments:read:department',
  ],
};

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed Permissions
  console.log('\n📝 Seeding permissions...');
  for (const perm of SYSTEM_PERMISSIONS) {
    const code = `${perm.module}:${perm.action}:${perm.resource}`;
    await prisma.permission.upsert({
      where: { code },
      update: {
        description: perm.description,
      },
      create: {
        code,
        module: perm.module,
        action: perm.action,
        resource: perm.resource,
        description: perm.description,
        isSystem: true,
      },
    });
    console.log(`  ✓ ${code}`);
  }

  console.log(`\n✅ Seeded ${SYSTEM_PERMISSIONS.length} permissions`);

  // Get all organizations to seed roles for each
  const organizations = await prisma.organization.findMany();
  
  if (organizations.length === 0) {
    console.log('\n⚠️  No organizations found. System roles will be created when organizations are registered.');
  } else {
    console.log(`\n🏢 Found ${organizations.length} organization(s). Seeding roles...`);
    
    for (const org of organizations) {
      console.log(`\n  Organization: ${org.name} (${org.companyCode})`);
      
      // Seed Roles for this organization
      for (const roleData of SYSTEM_ROLES) {
        const role = await prisma.role.upsert({
          where: {
            organizationId_code: {
              organizationId: org.id,
              code: roleData.code,
            },
          },
          update: {
            name: roleData.name,
            description: roleData.description,
          },
          create: {
            organizationId: org.id,
            code: roleData.code,
            name: roleData.name,
            description: roleData.description,
            isSystem: roleData.isSystem,
            isActive: true,
          },
        });
        console.log(`    ✓ Role: ${roleData.code}`);

        // Assign permissions to role
        const permissionCodes = ROLE_PERMISSIONS[roleData.code as keyof typeof ROLE_PERMISSIONS] || [];
        
        for (const permCode of permissionCodes) {
          const permission = await prisma.permission.findUnique({
            where: { code: permCode },
          });

          if (permission) {
            // Find a super admin user to assign as the assigner, or use the first user
            const assignerUser = await prisma.user.findFirst({
              where: { organizationId: org.id },
              orderBy: { createdAt: 'asc' },
            });

            if (assignerUser) {
              await prisma.rolePermission.upsert({
                where: {
                  roleId_permissionId: {
                    roleId: role.id,
                    permissionId: permission.id,
                  },
                },
                update: {},
                create: {
                  roleId: role.id,
                  permissionId: permission.id,
                  assignedById: assignerUser.id,
                },
              });
            }
          }
        }
        console.log(`      → Assigned ${permissionCodes.length} permissions`);
      }

      // Assign SUPER_ADMIN role to the first user (primary owner)
      const primaryOwner = await prisma.user.findFirst({
        where: { organizationId: org.id },
        orderBy: { createdAt: 'asc' },
      });

      if (primaryOwner) {
        const superAdminRole = await prisma.role.findFirst({
          where: {
            organizationId: org.id,
            code: 'SUPER_ADMIN',
          },
        });

        if (superAdminRole) {
          const existingAssignment = await prisma.userRole.findFirst({
            where: {
              userId: primaryOwner.id,
              roleId: superAdminRole.id,
            },
          });

          if (!existingAssignment) {
            await prisma.userRole.create({
              data: {
                userId: primaryOwner.id,
                roleId: superAdminRole.id,
                scopeType: 'global',
                assignedById: primaryOwner.id,
              },
            });
            console.log(`    ✓ Assigned SUPER_ADMIN to primary owner: ${primaryOwner.email}`);
          } else {
            console.log(`    ℹ️  Primary owner already has SUPER_ADMIN role`);
          }
        }
      }
    }
  }

  console.log('\n✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
