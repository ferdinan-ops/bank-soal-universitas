import { createComment, getAllComments, setFormComment, setQuestionId, updateComment } from "../../config/redux/actions/commentAction";
import { getQuestionById, likePost, savePost } from "../../config/redux/actions/postAction";
import { bookmark, bookmarked, download, like, liked } from "../../../public";
import { Author, Button, Info, Layout } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { authPage } from "../../middlewares/authPage";
import { slickSettings } from "../../utils/listData";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Ring } from "@uiball/loaders";
import Moment from "react-moment";
import Slider from "react-slick";
import Image from "next/image";

export async function getServerSideProps(context) {
  await authPage(context);
  return { props: {} }
}

export default function Detail() {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  const dispatch = useDispatch();
  const { question } = useSelector(state => state.postReducer);
  const { currentUser } = useSelector(state => state.authReducer);
  const { comments, formComment, isLoading, isEdit } = useSelector(state => state.commentReducer);

  const { id } = router.query;
  const { _id: userId } = currentUser;

  useEffect(() => { dispatch(getQuestionById(id)) }, [dispatch, id]);
  useEffect(() => { dispatch(getAllComments(id)) }, [dispatch, id]);
  useEffect(() => { dispatch(setQuestionId(id)) }, [dispatch, id]);
  useEffect(() => { setIsLiked((question?.likes?.findIndex((id) => id === String(userId))) !== -1) }, [question, isLiked, userId]);
  useEffect(() => { setIsSaved((question?.saved?.findIndex((id) => id === String(userId))) !== -1) }, [question, isLiked, userId]);

  const likePostHandler = async () => dispatch(likePost(id, { userId }));
  const savePostHandler = async () => dispatch(savePost(id, { userId }));

  const commentSubmitHandler = async (e) => {
    e.preventDefault();
    if (isEdit) return dispatch(updateComment(id, isEdit, { comment: formComment }));
    const formData = { comment: formComment, userId }
    dispatch(createComment(id, formData));
  }

  return (
    <>
      {question && (
        <Layout title={`BSU - ${question.mataKuliah}`}>
          <section className="mx-auto mt-[35px] w-full md:w-10/12 xl:w-8/12 text-font md:mt-[60px]">
            <div className="mb-10">
              <h1 className="text-center md:text-[32px] font-bold uppercase text-xl">{question.mataKuliah}</h1>
              <div className="flex items-center justify-center gap-4 md:gap-5 mt-10">
                {question?.user?.photo ?
                  <img src={question?.user?.photo} className="md:h-[50px] md:w-[50px] w-8 h-8 rounded-full object-cover" alt="" /> :
                  <img src="/images/profile.png" className="md:h-[50px] md:w-[50px] w-8 h-8 rounded-full object-cover" alt="" />
                }
                <div className="flex flex-col font-semibold text-sm md:text-base">
                  {question?.user?.username}
                  <Moment fromNow className="text-xs text-[#5C5C5C] md:text-sm">{question.createdAt}</Moment>
                </div>
              </div>
            </div>

            <div className="w-full">
              <Slider {...slickSettings}>
                {question?.images?.map((image, idx) => (
                  <img src={image} className="mx-auto rounded-lg" key={idx} alt="" />
                ))}
              </Slider>
            </div>


            <div className="mx-auto block w-fit rounded-lg bg-white p-6 shadow-lg my-10">
              <table cellPadding={5}>
                <tbody className="text-font text-sm md:text-base">
                  <Info title="Mata Kuliah" content={question.mataKuliah} />
                  <Info title="Fakultas" content={question.fakultas} />
                  <Info title="Program Studi" content={question.programStudi} />
                  <Info title="Semester" content={question.semester} />
                  <Info title="Kategori" content={question.kategori} />
                </tbody>
              </table>
              <div className="w-40 h-12 bg-primary text-font mx-auto mt-10 font-semibold text-sm rounded-lg hover:bg-primary/75">
                <Button><div className="relative w-7 h-7 mr-2">  <Image src={download} layout="fill" alt="" /></div>Download</Button>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="flex items-center gap-3 md:gap-5 mb-16">
                <div className="cursor-pointer relative md:w-[30px] md:h-[30px] w-7 h-7" onClick={likePostHandler}>
                  {isLiked ? <Image src={liked} layout="fill" alt="" /> : <Image src={like} layout="fill" alt="" />}
                </div>
                <span className="md:text-xl font-bold text-lg">{question?.likes?.length}</span>
              </div>
              <div className="flex items-center gap-3 md:gap-5 mb-16">
                <div className="cursor-pointer relative md:w-[26px] md:h-[26px] w-7 h-7" onClick={savePostHandler}>
                  {isSaved ? <Image src={bookmarked} layout="fill" alt="" /> : <Image src={bookmark} layout="fill" alt="" />}
                </div>
                <span className="md:text-xl font-bold text-lg">{question?.saved?.length}</span>
              </div>
            </div>

            <div className="comment mb-[100px]">
              <h1 className="border-b-2 border-[#DCDCDC] pb-5 md:text-2xl font-bold text-xl">{comments.length} Komentar</h1>

              {comments.map((comment) => (
                <div className="py-5 border-b-2 border-[#DCDCDC]" key={comment._id}>
                  <div className="flex items-center justify-between">
                    <Author user={comment.user} date={comment.updatedAt} contentId={comment} isComment size="md:w-[35px] md:h-[35px] w-6 h-6" />
                  </div>
                  <p className="mt-4 leading-relaxed ml-[47px] text-xs md:text-sm">{comment.comment}</p>
                </div>
              ))}

              <form className="flex flex-col text-font mt-[50px]">
                <label className="text-base md:text-lg font-semibold">Tulis Komentar:</label>
                <textarea
                  className="mt-5 h-72 rounded-lg border border-auth p-5 outline-none focus:border-primary text-sm md:text-base"
                  value={formComment}
                  onChange={(e) => dispatch(setFormComment(e.target.value))}
                />
                <div className={`shadow-button mt-[30px] ml-auto h-11 md:w-48 w-28 rounded-lg bg-primary font-semibold text-font ${isLoading && "pointer-events-none bg-opacity-40"}`}>
                  <Button type="submit" onClick={commentSubmitHandler}>
                    {isLoading ? (<Ring size={20} lineWeight={5} speed={2} color="#fff" />) : isEdit ? "Simpan" : "Kirim"}
                  </Button>
                </div>
              </form>
            </div>
          </section>
        </Layout>
      )}
    </>
  );
}
