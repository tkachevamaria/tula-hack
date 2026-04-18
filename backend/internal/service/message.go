package service

import "errors"

type MessageRepository interface {
	GetMessages(matchID int) ([]map[string]interface{}, error)
	SendMessage(matchID, senderID, receiverID int, text string) error
	CheckAccess(userID, matchID int) (bool, error)
}

type MessageService struct {
	repo MessageRepository
}

func NewMessageService(r MessageRepository) *MessageService {
	return &MessageService{repo: r}
}

func (s *MessageService) GetMessages(userID, matchID int) ([]map[string]interface{}, error) {

	ok, err := s.repo.CheckAccess(userID, matchID)
	if err != nil {
		return nil, err
	}

	if !ok {
		return nil, errors.New("no access")
	}

	return s.repo.GetMessages(matchID)
}

func (s *MessageService) SendMessage(matchID, senderID, receiverID int, text string) error {

	ok, err := s.repo.CheckAccess(senderID, matchID)
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("no access to this chat")
	}

	return s.repo.SendMessage(matchID, senderID, receiverID, text)
}
