import {
  useState,
  useEffect
} from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Box
} from "@mui/material";
import { Send } from "lucide-react";
import axios from "axios";

export default function WhatsAppChat() {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [newIncomeMessage, setNewIncomeMessage] = useState({});
  const [newExtendedMessage, setNewExtendedMessage] = useState({});
  const [newInterval, setNewInterval] = useState(false);

  const [chat, setChat] = useState({});
  const [apiUrl, setApiUrl] = useState("https://1103.api.green-api.com");

  const fetchDeleteData = async(receiptId) => {
    await axios.delete(`${apiUrl}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`);
  };

  let interval

  const receiveMessages = async() => {
    clearInterval(interval)
    if (idInstance && apiTokenInstance) {
      // console.log(idInstance && apiTokenInstance)
      try {
        const url = `${apiUrl}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`;
        const response = await axios.get(url);
        // console.log(response?.data);
        if (response?.data) {

          if (response.data.body.messageData?.textMessageData?.textMessage) {
            setNewIncomeMessage({ text: response.data.body.messageData?.textMessageData?.textMessage, recieptId: response.data.receiptId, chatId: response.data.body.senderData.chatId })
          }
          if (response.data.body.messageData?.extendedTextMessageData?.text) {
            // console.log(response.data.body.messageData.extendedTextMessageData?.text);
            setNewExtendedMessage({ text: response.data.body.messageData?.extendedTextMessageData?.text, recieptId: response.data.receiptId, chatId: response.data.body.senderData.chatId })
          }
          else {
            const receiptId = response.data.receiptId
            fetchDeleteData(receiptId)
          }
        }
        setNewInterval(prevState => !prevState)
      }
      catch (error) {
        console.error("Ошибка получения сообщений", error);
      }
    }
  };

  const sendMessage = async() => {
    if (!idInstance || !apiTokenInstance || !phoneNumber || !message) return;

    try {
      const url = `${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
      const payload = {
        chatId: `${phoneNumber}@c.us`,
        message: message,
      };

      await axios.post(url, payload);
      // setChat([...chat, { sender: "me", text: message }]);
      setMessage("");
    }
    catch (error) {
      console.error("Ошибка отправки сообщения", error);
    }
  };
  // console.log(chat);

  useEffect(() => {
    interval = setInterval(receiveMessages, 1000);
    return () => clearInterval(interval);
  }, [chat, idInstance, apiTokenInstance, apiUrl, newInterval]);

  useEffect(() => {
    // console.log(newIncomeMessage, newExtendedMessage);
    let newChat = { ...chat }

    if (newIncomeMessage?.text) {
      if (newChat[newIncomeMessage?.chatId]) {
        newChat[newIncomeMessage?.chatId] = [
          ...newChat[newIncomeMessage?.chatId],
          { sender: "them", text: newIncomeMessage.text }
        ]
      } else {
        newChat[newIncomeMessage.chatId] = [{ sender: "them", text: newIncomeMessage.text }]
      }
      const receiptId = newIncomeMessage.recieptId;
      fetchDeleteData(receiptId)
      setNewIncomeMessage({})
      setChat(newChat)
    }

    if (newExtendedMessage?.text) {
      if (newChat[newExtendedMessage?.chatId]) {
        newChat[newExtendedMessage?.chatId] = [
          ...newChat[newExtendedMessage?.chatId],
          { sender: "them", text: newExtendedMessage.text }
        ]
      } else {
        newChat[newExtendedMessage.chatId] = [{ sender: "me", text: newExtendedMessage.text }]
      }
      const receiptId = newExtendedMessage.recieptId;
      fetchDeleteData(receiptId)
      setNewExtendedMessage({})
      setChat(newChat)
    }

  }, [newIncomeMessage, newExtendedMessage])

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 4, width: "90%", minWidth: "20%" }}>
      <Card sx={{ width: "100%", mb: 4, p: 4 }}>
        <CardContent>
          <TextField label="idInstance" variant="outlined" fullWidth value={idInstance} onChange={(e) => setIdInstance(e.target.value)} margin="normal"/>
          <TextField label="apiTokenInstance" variant="outlined" fullWidth value={apiTokenInstance} onChange={(e) => setApiTokenInstance(e.target.value)} margin="normal"/>
          <TextField label="Номер телефона" variant="outlined" fullWidth value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} margin="normal"/>
          <TextField label="API URL" variant="outlined" fullWidth value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} margin="normal"/>
        </CardContent>
      </Card>

      <Card sx={{ width: "90%", height: "96", overflowY: "auto", p: 4, border: 1 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {chat[`${phoneNumber}@c.us`] &&
           chat[`${phoneNumber}@c.us`].map((msg, index) => (
            <Box key={index} sx={{ display: "flex", width: "100%", justifyContent: msg.sender === "me" ? "flex-end" : "flex-start" }}>
              <Box sx={{ p: 2, borderRadius: "8px", maxWidth: "xs", bgcolor: msg.sender === "me" ? "primary.main" : "grey.300", color: msg.sender === "me" ? "white" : "black" }}>
                {msg.text}
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", width: "100%", gap: 2, mt: 2 }}>
        <TextField label="Введите сообщение" variant="outlined" fullWidth value={message} onChange={(e) => setMessage(e.target.value)} margin="normal"/>
        <Button onClick={sendMessage} variant="contained" color="primary" sx={{ display: "flex", alignItems: "center" }}>
          <Send size={16}/>
        </Button>
      </Box>
    </Box>
  );
}
