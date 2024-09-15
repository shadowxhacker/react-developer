import { useState, useRef, useEffect } from "react";
import Action from "./Action";
import { ReactComponent as DownArrow } from "../../Assets/down-arrow.svg";
import { ReactComponent as UpArrow } from "../../Assets/up-arrow.svg";
import { doc, setDoc, updateDoc, deleteDoc, collection, addDoc } from "firebase/firestore";
import { db } from '../firebase';

const Comment = ({
  handleInsertNode,
  handleEditNode,
  handleDeleteNode,
  comment,
}) => {
  const [input, setInput] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [expand, setExpand] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editMode) inputRef.current?.focus();
  }, [editMode]);

  const handleNewComment = () => {
    setExpand(!expand);
    setShowInput(true);
  };

  const onAddComment = async () => {
    const commentData = {
      name: input || "Unnamed Comment",
      items: comment.items || [],
    };

    try {
      if (editMode) {
        // Update existing comment
        const commentRef = doc(db, 'comments', comment.id);
        await updateDoc(commentRef, commentData);
        console.log("Comment updated successfully");
      } else {
        // Add new comment
        const commentsCollection = collection(db, 'comments');
        await addDoc(commentsCollection, commentData);
        console.log("Comment added successfully");
      }
      setEditMode(false);
      setShowInput(false);
      setExpand(true);
      setInput("");
    } catch (error) {
      console.error("Error adding/updating comment: ", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const commentRef = doc(db, 'comments', comment.id);
        await deleteDoc(commentRef);
        console.log("Comment deleted successfully.");
      } catch (error) {
        console.error("Error deleting comment: ", error);
      }
    }
  };

  return (
    <div className="mt-5 w-fit">
      <div
        className={
          comment.id === 1
            ? "flex items-baseline gap-1"
            : "mt-1 bg-gray-300 flex flex-col p-2.5 w-[300px] cursor-pointer rounded-md hover:bg-gray-300/70"
        }
      >
        {comment.id === 1 ? (
          <>
            <input
              type="text"
              className="mt-1.5 p-1 border border-gray-300 rounded-md bg-gray-200"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your comment..."
            />
            <Action
              className="text-xs p-1 font-semibold rounded-md text-gray-700 cursor-pointer"
              type="COMMENT"
              handleClick={onAddComment}
            />
          </>
        ) : (
          <>
            <span
              contentEditable={editMode}
              suppressContentEditableWarning={editMode}
              ref={inputRef}
              onInput={(e) => setInput(e.currentTarget.innerText)}
              style={{ wordWrap: "break-word" }}
            >
              {comment.name}
            </span>
            <div className="flex mt-1.5">
              {editMode ? (
                <>
                  <Action
                    className="text-xs p-1 font-semibold rounded-md text-gray-700"
                    type="SAVE"
                    handleClick={onAddComment}
                  />
                  <Action
                    className="text-xs p-1 font-semibold rounded-md text-gray-700"
                    type="CANCEL"
                    handleClick={() => {
                      setInput(comment.name);
                      setEditMode(false);
                    }}
                  />
                </>
              ) : (
                <>
                  <Action
                    className="text-xs p-1 font-semibold rounded-md text-gray-700 w-[70px] flex"
                    type={
                      <>
                        {expand ? (
                          <UpArrow width="20px" height="10px" />
                        ) : (
                          <DownArrow width="20px" height="10px" />
                        )}{" "}
                        REPLY
                      </>
                    }
                    handleClick={handleNewComment}
                  />
                  <Action
                    className="text-xs p-1 font-semibold rounded-md text-gray-700"
                    type="EDIT"
                    handleClick={() => {
                      setEditMode(true);
                      setInput(comment.name);
                    }}
                  />
                  <Action
                    className="text-xs p-1 font-semibold rounded-md text-gray-700"
                    type="DELETE"
                    handleClick={handleDelete}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className={expand ? "block pl-6" : "hidden"}>
        {showInput && (
          <div className="flex items-baseline gap-1">
            <input
              type="text"
              className="mt-1.5 p-1 border border-gray-300 rounded-md bg-gray-200"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Action
              className="text-xs p-1 font-semibold rounded-md text-gray-700"
              type="REPLY"
              handleClick={onAddComment}
            />
            <Action
              className="text-xs p-1 font-semibold rounded-md text-gray-700"
              type="CANCEL"
              handleClick={() => {
                setShowInput(false);
                if (!comment?.items?.length) setExpand(false);
              }}
            />
          </div>
        )}

        {comment?.items?.map((cmnt) => (
          <Comment
            key={cmnt.id}
            handleInsertNode={handleInsertNode}
            handleEditNode={handleEditNode}
            handleDeleteNode={handleDeleteNode}
            comment={cmnt}
          />
        ))}
      </div>
    </div>
  );
};

export default Comment;
