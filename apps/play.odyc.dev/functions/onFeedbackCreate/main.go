package handler

import (
	"bytes"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/appwrite/sdk-for-go/appwrite"
	"github.com/open-runtimes/types-for-go/v4/openruntimes"
)

type RequestBody struct {
	FileId string `json:"fileId"`
	Text   string `json:"text"`
	Id     string `json:"$id"`
}

func Main(Context openruntimes.Context) openruntimes.Response {
	var body RequestBody
	err := Context.Req.BodyJson(&body)
	if err != nil {
		Context.Log("Body could not be parsed.")
		return Context.Res.Send("", Context.Res.WithStatusCode(400))
	}

	userId := Context.Req.Headers["x-appwrite-user-id"]
	if userId == "" {
		Context.Error("User ID is not set.")
		return Context.Res.Send("", Context.Res.WithStatusCode(400))
	}

	webhookURL := os.Getenv("DISCORD_WEBHOOK_URL")

	if webhookURL == "" {
		Context.Error("DISCORD_WEBHOOK_URL is not set.")
		return Context.Res.Send("", Context.Res.WithStatusCode(500))
	}

	client := appwrite.NewClient(
		appwrite.WithEndpoint(os.Getenv("APPWRITE_FUNCTION_API_ENDPOINT")),
		appwrite.WithProject(os.Getenv("APPWRITE_FUNCTION_PROJECT_ID")),
		appwrite.WithKey(Context.Req.Headers["x-appwrite-key"]),
	)
	users := appwrite.NewUsers(client)

	user, err := users.Get(userId)
	if err != nil {
		Context.Error("User not found.")
		return Context.Res.Send("", Context.Res.WithStatusCode(404))
	}

	accountAge := user.CreatedAt

	accountAgeTime, err := time.Parse(time.RFC3339, accountAge)
	if err != nil {
		Context.Error("Account age parsing error.")
		return Context.Res.Send("", Context.Res.WithStatusCode(500))
	}

	accountAgeVerbose := time.Since(accountAgeTime).String()

	name := "Anonymous"
	if user.Name != "" {
		name = user.Name
	} else if user.Email != "" {
		name = user.Email
	}

	unixTimestamp := time.Now().Unix()

	message := `{
	    "content": null,
	    "embeds": [
	      {
	        "title": "🧪 We recieved new feedback!",
	        "description": "An Odyc.js Play user just submitted a new feedback.",
	        "color": 14642836,
	        "fields": [
	          {
	            "name": "👤 User",
	            "value": "` + name + `",
	            "inline": true
	          },
	          {
	            "name": "🎂 Account Age",
	            "value": "` + accountAgeVerbose + `",
	            "inline": true
	          },
	          {
	            "name": "💬 Message",
	            "value": "` + body.Text + `",
	            "inline": true
	          },
	          {
	            "name": "📅 Timings",
	            "value": "Created <t:` + fmt.Sprintf("%d", unixTimestamp) + `:R>",
	            "inline": true
	          },
	          {
	            "name": "🔗 Quick Actions",
	            "value": "[Feedback](https://cloud.appwrite.io/console/project-fra-odyc-js/databases/database-main/collection-feedbacks/document-` + body.Id + `) | [User](https://cloud.appwrite.io/console/project-fra-odyc-js/auth/user-` + user.Id + `)",
	            "inline": true
	          }
	        ],
	        "image": {
	          "url": "https://fra.cloud.appwrite.io/v1/storage/buckets/feedbacks/files/` + body.FileId + `/view?project=odyc-js&mode=admin"
	        }
	      }
	    ],
	    "attachments": []
	  }`

	httpReq, err := http.NewRequest("POST", webhookURL, bytes.NewBuffer([]byte(message)))
	if err != nil {
		Context.Error("Error preparing webhook request.")
		return Context.Res.Send("", Context.Res.WithStatusCode(500))
	}

	httpReq.Header.Set("Content-Type", "application/json")

	httpClient := &http.Client{}
	resp, err := httpClient.Do(httpReq)
	if err != nil {
		Context.Error("Error sending Discord webhook.")
		return Context.Res.Send("", Context.Res.WithStatusCode(500))
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		Context.Error("Discord responded with " + strconv.Itoa(resp.StatusCode) + " error.")

		buf := new(bytes.Buffer)
		buf.ReadFrom(resp.Body)
		Context.Error(buf.String())

		return Context.Res.Send("", Context.Res.WithStatusCode(500))
	}

	Context.Log("Successfully sent Discord webhook.")
	return Context.Res.Send("", Context.Res.WithStatusCode(200))
}
