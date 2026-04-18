package tests

import (
	"database/sql"
	"log"
)

// Просмотр всех пользователей
func ShowUsers(db *sql.DB) {
	rows, err := db.Query("SELECT id, email, display_name, role FROM accounts")
	if err != nil {
		log.Println("Ошибка запроса:", err)
		return
	}
	defer rows.Close()

	log.Println("\n=== ПОЛЬЗОВАТЕЛИ В БД ===")
	for rows.Next() {
		var id int
		var email, name, role string
		rows.Scan(&id, &email, &name, &role)
		log.Printf("ID: %d | Email: %s | Name: %s | Role: %s",
			id, email, name, role)
	}
	log.Println("===========================")
}
