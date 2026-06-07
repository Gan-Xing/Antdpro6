// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /articles */
export async function articlesControllerFindAll(options?: { [key: string]: any }) {
  return request<NestWebAPI.ArticleEntity[]>('/articles', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /articles */
export async function articlesControllerCreate(
  body: NestWebAPI.CreateArticleDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.ArticleEntity>('/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /articles/${param0} */
export async function articlesControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.ArticlesControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.ArticleEntity>(`/articles/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /articles/${param0} */
export async function articlesControllerRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.ArticlesControllerRemoveParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.ArticleEntity>(`/articles/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /articles/${param0} */
export async function articlesControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.ArticlesControllerUpdateParams,
  body: NestWebAPI.UpdateArticleDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.ArticleEntity>(`/articles/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /articles/drafts */
export async function articlesControllerFindDrafts(options?: { [key: string]: any }) {
  return request<NestWebAPI.ArticleEntity[]>('/articles/drafts', {
    method: 'GET',
    ...(options || {}),
  });
}
