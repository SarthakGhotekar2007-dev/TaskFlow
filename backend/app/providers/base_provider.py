from abc import ABC, abstractmethod
from typing import List, Dict

class BaseLLMProvider(ABC):
    @abstractmethod
    def generate_text(self, prompt: str, system_prompt: str = None) -> str:
        pass
        
    @abstractmethod
    def generate_json(self, prompt: str, system_prompt: str = None) -> dict:
        pass
        
    @abstractmethod
    def chat(self, messages: List[Dict[str, str]]) -> str:
        """
        Messages format: [{"role": "user"|"assistant"|"system", "content": "..."}]
        """
        pass
