import os
import json
from typing import List, Dict
from app.providers.base_provider import BaseLLMProvider
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        # Assumes OPENAI_API_KEY is in environment
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0)

    def generate_text(self, prompt: str, system_prompt: str = None) -> str:
        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))
        
        response = self.llm.invoke(messages)
        return response.content

    def generate_json(self, prompt: str, system_prompt: str = None) -> dict:
        llm_json = ChatOpenAI(model="gpt-4o", temperature=0, model_kwargs={"response_format": {"type": "json_object"}})
        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        else:
            messages.append(SystemMessage(content="You are a helpful assistant designed to output JSON."))
        messages.append(HumanMessage(content=prompt))
        
        response = llm_json.invoke(messages)
        try:
            return json.loads(response.content)
        except json.JSONDecodeError:
            return {}

    def chat(self, messages: List[Dict[str, str]]) -> str:
        langchain_messages = []
        for msg in messages:
            if msg["role"] == "system":
                langchain_messages.append(SystemMessage(content=msg["message"]))
            elif msg["role"] == "user":
                langchain_messages.append(HumanMessage(content=msg["message"]))
            elif msg["role"] == "assistant":
                langchain_messages.append(AIMessage(content=msg["message"]))
                
        response = self.llm.invoke(langchain_messages)
        return response.content
