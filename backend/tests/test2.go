package tests

import (
	"database/sql"
	"log"
)

// Просмотр всех пользователей
func Test2(db *sql.DB) {
	rows, err := db.Query(`
		SELECT display_name
		FROM accounts
	`)
	if err != nil {
		log.Println("Ошибка запроса:", err)
		return
	}
	defer rows.Close()

	log.Println("\n======")
	for rows.Next() {
		var displayName string
		rows.Scan(&displayName)
		log.Printf("Display Name: %s", displayName)
	}
	log.Println("===========================")
}
