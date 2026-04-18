package database

import (
	"database/sql"
	"log"
)

func Migrate(db *sql.DB) {
	queries := []string{

		// ACCOUNTS (role - user/shelter)
		`CREATE TABLE IF NOT EXISTS accounts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL,
			display_name TEXT NOT NULL,
			bio TEXT,
			location TEXT,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP
		);`,

		// PETS (adoption_mode - open/strict) - штука для двойных метчей
		`CREATE TABLE IF NOT EXISTS pets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id INTEGER NOT NULL,
            name TEXT,
            type TEXT,
            breed TEXT,
            age INTEGER,
            description TEXT,
            adoption_mode TEXT,
            status TEXT DEFAULT 'available',
            FOREIGN KEY (owner_id) REFERENCES accounts(id)
        );`,

		// PET PHOTOS
		`CREATE TABLE IF NOT EXISTS pet_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id INTEGER NOT NULL,
            url TEXT,
            FOREIGN KEY (pet_id) REFERENCES pets(id)
        );`,

		`CREATE TABLE account_photos (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			account_id INTEGER NOT NULL,
			url TEXT NOT NULL,
			is_main INTEGER DEFAULT 0,
			FOREIGN KEY (account_id) REFERENCES accounts(id)
		);`,

		// SWIPES (user -> pet)
		`CREATE TABLE IF NOT EXISTS swipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            pet_id INTEGER NOT NULL,
            is_like INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES accounts(id),
            FOREIGN KEY (pet_id) REFERENCES pets(id)
        );`,

		// OWNER SWIPES (owner -> user)
		`CREATE TABLE IF NOT EXISTS owner_swipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            pet_id INTEGER NOT NULL,
            is_like INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES accounts(id),
            FOREIGN KEY (user_id) REFERENCES accounts(id),
            FOREIGN KEY (pet_id) REFERENCES pets(id)
        );`,

		// MATCHES
		`CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            pet_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES accounts(id),
            FOREIGN KEY (pet_id) REFERENCES pets(id)
        );`,

		// MESSAGES
		`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id INTEGER,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            text TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (match_id) REFERENCES matches(id),
            FOREIGN KEY (sender_id) REFERENCES accounts(id),
            FOREIGN KEY (receiver_id) REFERENCES accounts(id)
        );`,

		// USER PREFERENCES
		`CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            preferred_type TEXT,
            min_age INTEGER,
            max_age INTEGER,
            preferred_breed TEXT,
			preferred_location TEXT,
            FOREIGN KEY (user_id) REFERENCES accounts(id)
        );`,

		// PET TAGS
		`CREATE TABLE IF NOT EXISTS pet_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id INTEGER NOT NULL,
            tag TEXT,
            FOREIGN KEY (pet_id) REFERENCES pets(id)
        );`,
	}

	for _, q := range queries {
		_, err := db.Exec(q)
		if err != nil {
			log.Fatal("migration error:", err)
		}
	}

	log.Println("All tables migrated successfully")
}
