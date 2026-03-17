"""extend emergency_contact column length

Revision ID: 001
Revises: 
Create Date: 2026-03-16
"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('patients', 'emergency_contact',
                    existing_type=sa.String(20),
                    type_=sa.String(255),
                    existing_nullable=True)


def downgrade() -> None:
    op.alter_column('patients', 'emergency_contact',
                    existing_type=sa.String(255),
                    type_=sa.String(20),
                    existing_nullable=True)
