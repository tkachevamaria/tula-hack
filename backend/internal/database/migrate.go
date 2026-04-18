package database

import (
	"database/sql"
	"log"
)

func Migrate(db *sql.DB) {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL, // "user" or "shelter"
            name TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );`,

		`CREATE TABLE IF NOT EXISTS users_profile (
            account_id INTEGER PRIMARY KEY,
            age INTEGER,
            bio TEXT,
            location TEXT,
            FOREIGN KEY (account_id) REFERENCES accounts(id)
        );`,

		`CREATE TABLE IF NOT EXISTS shelters_profile (
            account_id INTEGER PRIMARY KEY,
            organization_name TEXT,
            description TEXT,
            address TEXT,
            verified INTEGER DEFAULT 0,
            FOREIGN KEY (account_id) REFERENCES accounts(id)
        );`,

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
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES accounts(id)
        );`,
	}

	for _, q := range queries {
		_, err := db.Exec(q)
		if err != nil {
			log.Fatal("migration error:", err)
		}
	}

	log.Println("DB migrated successfully")
}
