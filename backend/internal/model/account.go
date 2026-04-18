package model

type Account struct {
	ID           int
	Email        string
	PasswordHash string
	Role         string
	DisplayName  string
	Bio          string
	Location     string
}
