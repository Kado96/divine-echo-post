
import sqlite3
import os

db_path = r'e:\Application\Eglise\Shalom\divine-echo-post\backend\db.sqlite3'

def add_column(cursor, table, column, col_type):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
        print(f"✅ Ajouté {column} à {table}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"ℹ️ {column} existe déjà dans {table}")
        else:
            print(f"❌ Erreur sur {column} dans {table}: {e}")

def main():
    if not os.path.exists(db_path):
        print(f"❌ Base de données introuvable à {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # --- SermonCategory ---
    table_cat = "sermons_sermoncategory"
    print(f"\nVérification de {table_cat}...")
    add_column(cursor, table_cat, "name_fr", "VARCHAR(100)")
    add_column(cursor, table_cat, "name_en", "VARCHAR(100)")
    add_column(cursor, table_cat, "name_rn", "VARCHAR(100)")
    add_column(cursor, table_cat, "name_sw", "VARCHAR(100)")
    add_column(cursor, table_cat, "description_fr", "TEXT")
    add_column(cursor, table_cat, "description_en", "TEXT")
    add_column(cursor, table_cat, "description_rn", "TEXT")
    add_column(cursor, table_cat, "description_sw", "TEXT")
    add_column(cursor, table_cat, "icon", "VARCHAR(10)")

    # --- Sermon ---
    table_sermon = "sermons_sermon"
    print(f"\nVérification de {table_sermon}...")
    add_column(cursor, table_sermon, "content_type", "VARCHAR(10) DEFAULT 'video'")
    add_column(cursor, table_sermon, "title_fr", "VARCHAR(200)")
    add_column(cursor, table_sermon, "title_en", "VARCHAR(200)")
    add_column(cursor, table_sermon, "title_rn", "VARCHAR(200)")
    add_column(cursor, table_sermon, "title_sw", "VARCHAR(200)")
    add_column(cursor, table_sermon, "description_fr", "TEXT")
    add_column(cursor, table_sermon, "description_en", "TEXT")
    add_column(cursor, table_sermon, "description_rn", "TEXT")
    add_column(cursor, table_sermon, "description_sw", "TEXT")
    add_column(cursor, table_sermon, "audio_url", "VARCHAR(200)")
    add_column(cursor, table_sermon, "audio_file", "VARCHAR(100)")
    add_column(cursor, table_sermon, "views_count", "INTEGER DEFAULT 0")

    conn.commit()
    conn.close()
    print("\n✅ Terminé !")

if __name__ == "__main__":
    main()
