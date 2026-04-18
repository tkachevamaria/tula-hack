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

	r := gin.Default()

	// AUTH
	r.POST("/auth/register", authHandler.Register)
	r.POST("/auth/login", authHandler.Login)

	// ACCOUNT
	accountRepo := repository.NewAccountRepository(db)
	accountService := service.NewAccountService(accountRepo)
	accountHandler := handlers.NewAccountHandler(accountService)

	r.GET("/me", accountHandler.GetMe)
	r.PUT("/me", accountHandler.UpdateMe)

	// PETS
	petRepo := repository.NewPetRepository(db)
	petService := service.NewPetService(petRepo)
	petHandler := handlers.NewPetHandler(petService)

	r.POST("/pets", petHandler.CreatePet)
	r.GET("/pets/feed", petHandler.GetFeed)
	r.GET("/pets/:id", petHandler.GetPet)
	r.GET("/my-pets", petHandler.GetMyPets)
	r.GET("/users/:id/pets", petHandler.GetUserPets) // для любого пользователя

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
