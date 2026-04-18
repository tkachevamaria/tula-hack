package main

import (
	"log"

	"github.com/gin-contrib/cors"
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

	r.Use(cors.Default())

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

	// SWIPES и MATCHES
	swipeRepo := repository.NewSwipeRepository(db)
	swipeService := service.NewSwipeService(swipeRepo)
	swipeHandler := handlers.NewSwipeHandler(swipeService)

	r.POST("/swipes", swipeHandler.Swipe)
	r.POST("/owner-swipes", swipeHandler.OwnerSwipe)
	r.GET("/matches", swipeHandler.GetMatches)

	// MESSAGES
	msgRepo := repository.NewMessageRepository(db)
	msgService := service.NewMessageService(msgRepo)
	msgHandler := handlers.NewMessageHandler(msgService)

	r.GET("/matches/:id/messages", msgHandler.GetMessages)
	r.POST("/messages", msgHandler.SendMessage)

	// PREFERENCES

	prefRepo := repository.NewPreferencesRepository(db)
	prefService := service.NewPreferencesService(prefRepo)
	prefHandler := handlers.NewPreferencesHandler(prefService)

	r.POST("/preferences", prefHandler.SetPreferences)
	r.GET("/preferences", prefHandler.GetPreferences)

	log.Println("Server started on :8080")
	r.Run(":8080")
}
