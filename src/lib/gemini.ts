import { GoogleGenerativeAI } from "@google/generative-ai";

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const model = genAi.getGenerativeModel({
  model: "gemini-1.5-flash",
});
export const aiSummarizeCommit = async (diff: string) => {
    console.log("aiSUMMARIZE-COMMIT CALLED")
  const response = await model.generateContent([
    `You are an expert programmer, and you are trying to summarize a git diff.
    Reminders about the git diff format:
    For every file, there are a few metadata lines, like (for example):
    
    css
    Copy
    Edit
    diff --git a/lib/index.js b/lib/index.js  
    index aadf691..bfef603 100644  
    --- a/lib/index.js  
    +++ b/lib/index.js  
    This means that lib/index.js was modified in this commit. Note that this is only an example.
    Then there is a specifier of the lines that were modified.
    
    A line starting with + means it was added.
    A line starting with - means that line was deleted.
    A line that starts with neither + nor - is code given for context and better understanding.
    It is not part of the diff.
    EXAMPLE SUMMARY COMMENTS:
    
    * Raised the amount of returned recordings from "10" to "100" [packages/server/recordings_api.ts], [packages/server/constants.ts]
    * Fixed a typo in the GitHub action name [.github/workflows/gpt-commit-summarizer.yml]
    * Moved the octokit initialization to a separate file [src/octokit.ts], [src/index.ts]
    * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
    * Lowered numeric tolerance for test files
    Most commits will have fewer comments than this examples list.
    The last comment does not include the file names because there were more than two relevant files in the hypothetical commit.
    
    Do not include parts of the example in your summary.
    It is given only as an example of appropriate comments.
    
    "Please summarise the following diff file: \n\n${diff}.`,
  ]);
  console.log( "Hi => ", response.response.text());
  return response.response.text();
};

// console.log(await aiSummarizeCommit(`diff --git a/api.py b/api.py
// index f79b5158..37271d96 100644
// --- a/api.py
// +++ b/api.py
// @@ -1,6 +1,6 @@
//  import os
 
// -from langchain.graphs import Neo4jGraph
// +from langchain_community.graphs import Neo4jGraph
//  from dotenv import load_dotenv
//  from utils import (
//      create_vector_index,
// diff --git a/bot.py b/bot.py
// index 61a5cd98..4146af07 100644
// --- a/bot.py
// +++ b/bot.py
// @@ -3,7 +3,7 @@
//  import streamlit as st
//  from streamlit.logger import get_logger
//  from langchain.callbacks.base import BaseCallbackHandler
// -from langchain.graphs import Neo4jGraph
// +from langchain_community.graphs import Neo4jGraph
//  from dotenv import load_dotenv
//  from utils import (
//      create_vector_index,
// diff --git a/chains.py b/chains.py
// index cfd87825..1166adf7 100644
// --- a/chains.py
// +++ b/chains.py
// @@ -1,18 +1,26 @@
// -from langchain.embeddings.openai import OpenAIEmbeddings
// -from langchain.embeddings import (
// -    OllamaEmbeddings,
// -    SentenceTransformerEmbeddings,
// -    BedrockEmbeddings,
// -)
// -from langchain.chat_models import ChatOpenAI, ChatOllama, BedrockChat
// -from langchain.vectorstores.neo4j_vector import Neo4jVector
// +
// +from langchain_openai import OpenAIEmbeddings
// +from langchain_community.embeddings import OllamaEmbeddings
// +from langchain_community.embeddings import BedrockEmbeddings
// +from langchain_community.embeddings.sentence_transformer import SentenceTransformerEmbeddings
// +
// +from langchain_openai import ChatOpenAI
// +from langchain_community.chat_models import ChatOllama
// +from langchain_community.chat_models import BedrockChat
// +
// +from langchain_community.graphs import Neo4jGraph
// +
// +from langchain_community.vectorstores import Neo4jVector
// +
//  from langchain.chains import RetrievalQAWithSourcesChain
//  from langchain.chains.qa_with_sources import load_qa_with_sources_chain
// -from langchain.prompts.chat import (
// +
// +from langchain.prompts import (
//      ChatPromptTemplate,
// -    SystemMessagePromptTemplate,
//      HumanMessagePromptTemplate,
// +    SystemMessagePromptTemplate
//  )
// +
//  from typing import List, Any
//  from utils import BaseLogger, extract_title_and_question
 
// diff --git a/loader.py b/loader.py
// index 8cc08023..6a620604 100644
// --- a/loader.py
// +++ b/loader.py
// @@ -1,7 +1,7 @@
//  import os
//  import requests
//  from dotenv import load_dotenv
// -from langchain.graphs import Neo4jGraph
// +from langchain_community.graphs import Neo4jGraph
//  import streamlit as st
//  from streamlit.logger import get_logger
//  from chains import load_embedding_model
// diff --git a/pdf_bot.py b/pdf_bot.py
// index 08ef9d41..fb8f4d46 100644
// --- a/pdf_bot.py
// +++ b/pdf_bot.py
// @@ -3,9 +3,9 @@
//  import streamlit as st
//  from langchain.chains import RetrievalQA
//  from PyPDF2 import PdfReader
// -from langchain.text_splitter import RecursiveCharacterTextSplitter
//  from langchain.callbacks.base import BaseCallbackHandler
// -from langchain.vectorstores.neo4j_vector import Neo4jVector
// +from langchain.text_splitter import RecursiveCharacterTextSplitter
// +from langchain_community.vectorstores import Neo4jVector
//  from streamlit.logger import get_logger
//  from chains import (
//      load_embedding_model,
// diff --git a/requirements.txt b/requirements.txt
// index e7ddf21b..9aa7e4c8 100644
// --- a/requirements.txt
// +++ b/requirements.txt
// @@ -1,4 +1,4 @@
// -openai==0.28.1
// +openai
//  python-dotenv
//  wikipedia
//  tiktoken
// @@ -13,3 +13,6 @@ pydantic
//  uvicorn
//  sse-starlette
//  boto3
// +# missing from the langchain base image?
// +langchain-openai
// +langchain-community`));

