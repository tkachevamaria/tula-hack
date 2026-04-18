package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/tkachevamaria/tula-hack/backend/internal/database"
	"github.com/tkachevamaria/tula-hack/backend/internal/handlers"
)

func main() {
	db := database.InitDB("./data.db")
	defer db.Close()

	database.Migrate(db)

	// Gin
	r := gin.Default()

	// AUTH
	r.POST("/auth/register", handlers.Register)
	r.POST("/auth/login", handlers.Login)

	// ACCOUNT
	r.GET("/me", handlers.GetMe)
	r.PUT("/me", handlers.UpdateMe)

	// PETS
	r.POST("/pets", handlers.CreatePet)
	r.GET("/pets/feed", handlers.GetFeed)
	r.GET("/pets/:id", handlers.GetPet)
	r.GET("/my-pets", handlers.GetMyPets)

	// SWIPES
	r.POST("/swipes", handlers.Swipe)
	r.POST("/owner-swipes", handlers.OwnerSwipe)

	// MATCHES
	r.GET("/matches", handlers.GetMatches)

	// MESSAGES
	r.GET("/matches/:id/messages", handlers.GetMessages)
	r.POST("/messages", handlers.SendMessage)

	// PREFERENCES
	r.POST("/preferences", handlers.SetPreferences)
	r.GET("/preferences", handlers.GetPreferences)

	log.Println("Server started on :8080")
	r.Run(":8080")

	log.Println("Server started")
}
