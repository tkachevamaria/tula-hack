package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/tkachevamaria/tula-hack/backend/internal/database"
	"github.com/tkachevamaria/tula-hack/backend/internal/handlers"
	"github.com/tkachevamaria/tula-hack/backend/internal/repository"
	"github.com/tkachevamaria/tula-hack/backend/internal/service"
)

func main() {
	db := database.InitDB("./data.db")
	defer db.Close()

	database.Migrate(db)
	authRepo := repository.NewAuthRepository(db)
	authService := service.NewAuthService(authRepo)
	authHandler := handlers.NewAuthHandler(authService) // Gin

	//tests.ShowUsers(db) //тест прост

	r := gin.Default()

	// AUTH
	r.POST("/auth/register", authHandler.Register)
	r.POST("/auth/login", authHandler.Login)

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
}
