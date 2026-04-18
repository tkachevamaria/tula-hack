package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/tkachevamaria/tula-hack/backend/internal/service"
)

type MessageHandler struct {
	service *service.MessageService
}

func NewMessageHandler(s *service.MessageService) *MessageHandler {
	return &MessageHandler{service: s}
}

func (h *MessageHandler) GetMessages(c *gin.Context) {
	_, ok := GetUserID(c)
	if !ok {
		return
	}

	matchIDStr := c.Param("id")
	matchID, _ := strconv.Atoi(matchIDStr)

	messages, err := h.service.GetMessages(matchID)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, messages)
}

type SendMessageInput struct {
	MatchID    int    `json:"match_id"`
	ReceiverID int    `json:"receiver_id"`
	Text       string `json:"text"`
}

func (h *MessageHandler) SendMessage(c *gin.Context) {
	senderID, ok := GetUserID(c)
	if !ok {
		return
	}

	var input SendMessageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err := h.service.SendMessage(
		input.MatchID,
		senderID,
		input.ReceiverID,
		input.Text,
	)

	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, gin.H{"message": "sent"})
}
