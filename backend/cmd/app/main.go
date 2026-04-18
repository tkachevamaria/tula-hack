package main

import (
	"log"

	"github.com/tkachevamaria/tula-hack/backend/internal/database"
)

func main() {
	db := database.InitDB("./data.db")
	defer db.Close()

	database.Migrate(db)

	log.Println("Server started")
}
