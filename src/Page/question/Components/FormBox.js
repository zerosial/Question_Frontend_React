import React, { useState } from "react";
import { SelectBox } from "./SelectBox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { POSTDisclosureItem } from "api/apiService";
import { escapeInput } from "utils/escapeInput";
import { validateForm } from "utils/validateForm";
import { useModalStore } from "store/useModalStore";
import { convertKoreanToEnglish } from "utils/convertKoreanToEnglish";
import { SpinnerButton } from "Components/SpinnerButton";
import { useSyncedEmailStore } from "store/useSyncedEmailStore";

export const FormBox = ({ goToTab }) => {
  // 이메일, 모달 Store
  const { email } = useSyncedEmailStore();
  const { openModal } = useModalStore();

  // React Hooks
  const [selectedTabInfo, setSelectedTabInfo] = useState({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // React-Query
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: POSTDisclosureItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questionList"] });
      openModal("1:1 문의가 등록되었습니다.", () => {
        goToTab(1);
        setTitle("");
        setContent("");
      });
    },
    onError: () => openModal("삭제에 실패했습니다."),
  });

  const onSubmitHandler = (e) => {
    const validationError = validateForm({ title, content, email });
    e.preventDefault();

    // 로딩 중 얼리 리턴
    if (isPending) return;

    // 폼 체크
    if (validationError) {
      openModal(validationError);
      return;
    }

    //데이터 mutation
    mutate({
      title: escapeInput(title),
      content: escapeInput(content),
      questionCategory: convertKoreanToEnglish(selectedTabInfo.service),
      questionDetail: convertKoreanToEnglish(selectedTabInfo.serviceSub),
      userEmail: email,
    });
  };

  return (
    <form onSubmit={onSubmitHandler}>
      <div className="mt-4">
        <SelectBox setSelectedTabInfo={setSelectedTabInfo} />
        <input
          className="mt-2 p-2 w-full border border-gray-300 rounded-lg"
          placeholder="제목을 입력해주세요(50자 내)"
          disabled={isPending}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="mt-2 p-2 w-full h-64 border border-gray-300 rounded-lg"
          placeholder="내용을 입력해주세요"
          disabled={isPending}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="w-full mt-4 p-4 rounded-lg bg-blue-500 text-white text-xl text-center"
      >
        {isPending ? <SpinnerButton /> : "등록하기"}
      </button>
    </form>
  );
};
